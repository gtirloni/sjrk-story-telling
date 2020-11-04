/*
For copyright information, see the AUTHORS.md file in the docs directory of this distribution and at
https://github.com/fluid-project/sjrk-story-telling/blob/main/docs/AUTHORS.md

Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/main/LICENSE.txt
*/

"use strict";

var fluid = require("infusion"),
    sjrk = fluid.registerNamespace("sjrk"),
    kettle = require("kettle"),
    fs = require("fs"),
    MemoryStore = require('memorystore')(kettle.npm.expressSession);

require("fluid-express-user");
var { v1: uuidv1 } = require("uuid");

// The main Kettle server configuration grade
fluid.defaults("sjrk.storyTelling.server", {
    gradeNames: ["fluid.component"],
    components: {
        // the Kettle server proper
        server: {
            type: "kettle.server",
            options: {
                gradeNames: ["kettle.server.sessionAware"],
                globalConfig: {
                    // Config values are stored in the external config file
                    // named "sjrk.storyTelling.server.themed.json5"
                    // and are merged in on server startup
                    // port: "",
                    // theme: "",
                    // themeIndexFile": "",
                    // authoringEnabled: true
                },
                secureConfig: {
                    baseThemeName: "base",
                    themesPath: "./themes/%theme",
                    binaryUploadDirectory: "./uploads",
                    uploadedFilesHandlerPath: "/uploads",
                    deletedFilesRecoveryPath: "/deleted_uploads",
                    secretsConfigPath: "./secrets.json",
                    secrets: "@expand:sjrk.storyTelling.server.resolveJSONFile({that}.options.secureConfig.secretsConfigPath)"
                },
                port: "{that}.options.globalConfig.port",
                session: {
                    store: "@expand:sjrk.storyTelling.server.makeMemorySessionStore()",
                    middlewareOptions: {
                        secret: "{server}.options.secureConfig.secrets.session"
                    }
                },
                distributeOptions: {
                    couchDBURL: {
                        record: "@expand:kettle.resolvers.env(COUCHDB_URL)",
                        target: "{that sjrk.storyTelling.server.dataSource.couch.core}.options.host"
                    },
                    couchDBURLUsers: {
                        record: "@expand:kettle.resolvers.env(COUCHDB_URL)",
                        target: "{that gexpressUserUtils}.options.dataSourceConfig.host"
                    },
                    sessionOptions: {
                        source: "{that}.options.session",
                        target: "{that > kettle.middlewareHolder > session}.options"
                    }
                },
                components: {
                    // user authentication
                    expressUserUtils: {
                        type: "fluid.express.user.utils",
                        options: {
                            dataSourceConfig: {
                                host: "http://localhost:5984",
                                path: "users"
                            },
                            rules: {
                                createUserWrite: {
                                    "authorID": "authorID"
                                }
                            },
                            couch: {
                                userDbUrl: {
                                    expander: {
                                        funcName: "fluid.stringTemplate",
                                        args: ["%host/%path", {
                                            host: "{expressUserUtils}.options.dataSourceConfig.host",
                                            path: "{expressUserUtils}.options.dataSourceConfig.path"
                                        }]
                                    }
                                }
                            }
                        }
                    },
                    // a DataSource to get a list of stories
                    viewDataSource: {
                        type: "sjrk.storyTelling.server.dataSource.couch.view"
                    },
                    // a DataSource to get or save a single story
                    storyDataSource: {
                        type: "sjrk.storyTelling.server.dataSource.couch.story"
                    },
                    // a DataSource to delete a single story
                    deleteStoryDataSource: {
                        type: "sjrk.storyTelling.server.dataSource.couch.deleteStory"
                    },
                    // a DataSource to save a single story along with any files it has
                    saveStoryWithBinaries: {
                        type: "sjrk.storyTelling.server.middleware.saveStoryWithBinaries",
                        options: {
                            components: {
                                storage: {
                                    options: {
                                        destination: "{server}.options.secureConfig.binaryUploadDirectory"
                                    }
                                }
                            }
                        }
                    },
                    // the Kettle app
                    app: {
                        type: "sjrk.storyTelling.server.app.storyTellingHandlers"
                    },
                    // middleware to coordinate HTTP Basic Authentication
                    basicAuth: {
                        type: "kettle.middleware.basicAuth",
                        options: {
                            middlewareOptions: {
                                users: {
                                    "admin": "{server}.options.secureConfig.secrets.adminPass"
                                },
                                challenge: true
                            }
                        }
                    },
                    // middleware to restrict serving to only those directories listed
                    nodeModulesFilter: {
                        type: "sjrk.storyTelling.server.staticMiddlewareSubdirectoryFilter",
                        options: {
                            allowedSubdirectories: [
                                "blueimp-canvas-to-blob",
                                "blueimp-load-image",
                                "fluid-binder",
                                "fluid-handlebars",
                                "fluid-location-bar-relay",
                                "handlebars",
                                "infusion",
                                "markdown-it",
                                "sinon"]
                        }
                    },
                    // static middleware for the node_modules directory
                    nodeModules: {
                        type: "kettle.middleware.static",
                        options: {
                            "root": "./node_modules"
                        }
                    },
                    // static middleware for the uploads directory
                    uploads: {
                        type: "kettle.middleware.static",
                        options: {
                            "root": "{server}.options.secureConfig.binaryUploadDirectory"
                        }
                    },
                    // static middleware for the ui directory
                    ui: {
                        type: "kettle.middleware.static",
                        options: {
                            "root": "./src/ui"
                        }
                    },
                    // the custom theme for the site, loaded in "on top" of base
                    currentTheme: {
                        type: "kettle.middleware.static",
                        options: {
                            root: "@expand:sjrk.storyTelling.server.getThemePath({server}.options.globalConfig.theme, {server}.options.secureConfig.themesPath)",
                            middlewareOptions: {
                                index: "{server}.options.globalConfig.themeIndexFile"
                            }
                        }
                    },
                    // the default theme and base pages for the site
                    baseTheme: {
                        type: "kettle.middleware.static",
                        options: {
                            root: "@expand:sjrk.storyTelling.server.getThemePath({server}.options.secureConfig.baseThemeName, {server}.options.secureConfig.themesPath)",
                            middlewareOptions: {
                                index: "storyBrowse.html"
                            }
                        }
                    }
                }
            }
        }
    }
});

// the Kettle app
fluid.defaults("sjrk.storyTelling.server.app.storyTellingHandlers", {
    gradeNames: ["kettle.app"],
    requestHandlers: {
        browseStoriesHandler: {
            type: "sjrk.storyTelling.server.browseStoriesHandler",
            "route": "/stories/",
            "method": "get"
        },
        getStoryHandler: {
            type: "sjrk.storyTelling.server.getStoryHandler",
            "route": "/stories/:id",
            "method": "get"
        },
        saveStoryWithBinariesHandler: {
            type: "sjrk.storyTelling.server.saveStoryWithBinariesHandler",
            "route": "/stories/",
            "method": "post"
        },
        deleteStoryHandler: {
            type: "sjrk.storyTelling.server.deleteStoryHandler",
            "route": "/admin/deleteStory/:id",
            "method": "get"
        },
        uiHandler: {
            type: "sjrk.storyTelling.server.uiHandler",
            "route": "/*",
            "prefix": "/src",
            "method": "get"
        },
        nodeModulesHandler: {
            type: "sjrk.storyTelling.server.nodeModulesHandler",
            "route": "/*",
            "method": "get",
            "prefix": "/node_modules"
        },
        uploadsHandler: {
            type: "sjrk.storyTelling.server.uploadsHandler",
            "route": "/*",
            "method": "get",
            "prefix": "{server}.options.secureConfig.uploadedFilesHandlerPath"
        },
        clientConfigHandler: {
            type: "sjrk.storyTelling.server.clientConfigHandler",
            route: "/clientConfig",
            method: "get"
        },
        sesstionTest: {
            type: "sjrk.storyTelling.server.sessionTestHandler",
            "route": "/session",
            method: "get"
        },
        signupTest: {
            type: "sjrk.storyTelling.server.signupTestHandler",
            "route": "/users/signup",
            method: "post"
        },
        loginTest: {
            type: "sjrk.storyTelling.server.loginTestHandler",
            "route": "/users/login",
            method: "post"
        },
        logoutTest: {
            type: "sjrk.storyTelling.server.logoutTestHandler",
            "route": "/users/logout",
            method: "post"
        },
        themeHandler: {
            type: "sjrk.storyTelling.server.themeHandler",
            "route": "/*",
            "method": "get"
        }
    }
});

/***************************
 * Test setup for sessions *
 ***************************/

fluid.defaults("sjrk.storyTelling.server.sessionTestHandler", {
    gradeNames: ["kettle.request.http", "kettle.request.sessionAware"],
    invokers: {
        handleRequest: {
            funcName: "sjrk.storyTelling.server.handleSessionTestRequest",
            args: ["{request}"]
        }
    }
});

/**
 * Test handler for using sessions.
 *
 * @param {Object} request - a Kettle request
 */
sjrk.storyTelling.server.handleSessionTestRequest = function (request) {
    // TODO: update this to be the
    // request.req.session.text = request.req.session.text || `testing - ${request.req.sessionID}`;
    // request.events.onSuccess.fire(`session request: ${request.req.session.text}\n`);
    request.events.onSuccess.fire(`authorID: ${request.req.session.authorID || "unknown"}\n`);
};

/**************************************
 * Test setup for signup/login/logout *
 **************************************/

fluid.defaults("sjrk.storyTelling.server.signupTestHandler", {
    gradeNames: ["kettle.request.http", "kettle.request.sessionAware"],
    invokers: {
        handleRequest: {
            funcName: "sjrk.storyTelling.server.handleSignupTestRequest",
            args: ["{request}", "{expressUserUtils}"]
        }
    }
});

/**
 * Test handler for signup.
 *
 * @param {Object} request - a Kettle request
 */
sjrk.storyTelling.server.handleSignupTestRequest = function (request, expressUserUtils) {
    var promise = expressUserUtils.createNewUser({
        username: request.req.body.username,
        email: request.req.body.email,
        password: request.req.body.password,
        authorID: uuidv1()
    });

    promise.then(function (record) {
        request.req.session.authorID = record.authorID;
        request.events.onSuccess.fire("success");
    }, function (error) {
        request.events.onError.fire(error);
    });

    // request.events.onSuccess.fire("not created");
};

fluid.defaults("sjrk.storyTelling.server.loginTestHandler", {
    gradeNames: ["kettle.request.http", "kettle.request.sessionAware"],
    invokers: {
        handleRequest: {
            funcName: "sjrk.storyTelling.server.handleLoginTestRequest",
            args: ["{request}", "{expressUserUtils}"]
        }
    }
});

/**
 * Test handler for login.
 *
 * @param {Object} request - a Kettle request
 */
sjrk.storyTelling.server.handleLoginTestRequest = function (request, expressUserUtils) {
    var promise = expressUserUtils.unlockUser(request.req.body.username, request.req.body.password);

    promise.then(function (record) {
        request.req.session.authorID = record.authorID;
        request.events.onSuccess.fire("success");
    }, function (error) {
        request.events.onError.fire(error);
    });

    // request.events.onSuccess.fire("not logged in");
};

fluid.defaults("sjrk.storyTelling.server.logoutTestHandler", {
    gradeNames: ["kettle.request.http", "kettle.request.sessionAware"],
    invokers: {
        handleRequest: {
            funcName: "sjrk.storyTelling.server.handleLogoutTestRequest",
            args: ["{request}"]
        }
    }
});

/**
 * Test handler for logout.
 *
 * @param {Object} request - a Kettle request
 */
sjrk.storyTelling.server.handleLogoutTestRequest = function (request, expressUserUtils) {
    request.req.session.destroy();
    request.events.onSuccess.fire("logout successful");
};

/******************************************
 * End Test setup for signup/login/logout *
 ******************************************/


/**
 * Resolves a JSON file and parses it before returning it
 *
 * @param {String} jsonFilePath - the path to the JSON file to parse
 *
 * @return {Object} - the parsed file contents
 */
sjrk.storyTelling.server.resolveJSONFile = function (jsonFilePath) {
    var file = kettle.resolvers.file(jsonFilePath);
    return JSON.parse(file);
};

/**
 * Returns the path to the custom theme folder. The theme folder's name is
 * expected to match the theme name being passed in. If the theme is not
 * specified, the path returend will be the current directory ("."). If the
 * theme is specified but the resolved folder doesn't exist within themeFolder,
 * an error will be reported.
 *
 * @param {String} theme - The name of the theme for which to find the path
 * @param {String} themeFolder - The folder/path that contains the theme being retrieved
 *
 * @return {String} - the custom theme directory's path
 */
sjrk.storyTelling.server.getThemePath = function (theme, themeFolder) {
    var themePath = ".";

    if (theme) {
        themePath = fluid.stringTemplate(themeFolder, { theme: theme });

        if (!fs.existsSync(themePath)) {
            fluid.fail("The custom theme folder " + themePath + " does not exist. Please verify that the theme name is configured properly.");
        }
    }

    return themePath;
};

sjrk.storyTelling.server.makeMemorySessionStore = function () {
    // TODO: Currently using https://www.npmjs.com/package/memorystore as it is a production ready memory store;
    //       however, the session should eventually be stored in a database to prevent clearing on server restart.
    return new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    });
};
