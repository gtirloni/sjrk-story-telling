/*
Copyright 2017 OCAD University
Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/waharnum/sjrk-storyTelling/master/LICENSE.txt
*/

"use strict";

var fluid = require("infusion");
require("kettle");
require("./dataSource");

var sjrk = fluid.registerNamespace("sjrk");

fluid.defaults("sjrk.storyTelling.server", {
    gradeNames: "fluid.component",
    components: {
        server: {
            type: "kettle.server",
            options: {
                port: 8081,
                components: {
                    ui: {
                        type: "kettle.middleware.static",
                        options: {
                            "root": "./ui"
                        }
                    },
                    infusionNodeModules: {
                        type: "kettle.middleware.static",
                        options: {
                            "root": "./node_modules/infusion"
                        }
                    },
                    binderNodeModules: {
                        type: "kettle.middleware.static",
                        options: {
                            "root": "./node_modules/gpii-binder"
                        }
                    },
                    storytellingNodeModules: {
                        type: "kettle.middleware.static",
                        options: {
                            "root": "./node_modules/sjrk-storytelling"
                        }
                    },
                    app: {
                        type: "sjrk.storyTelling.server.app"
                    },
                    dataSource: {
                        type: "sjrk.storyTelling.server.dataSource"
                    }
                }
            }
        }
    }
});

fluid.defaults("sjrk.storyTelling.server.app", {
    gradeNames: ["kettle.app"],
    requestHandlers: {
        infusionNodeModulesHandler: {
            type: "sjrk.storyTelling.server.infusionNodeModulesHandler",
            "route": "/*",
            "method": "get",
            "prefix": "/node_modules/infusion"
        },
        binderNodeModulesHandler: {
            type: "sjrk.storyTelling.server.binderNodeModulesHandler",
            "route": "/*",
            "method": "get",
            "prefix": "/node_modules/gpii-binder"
        },
        storytellingNodeModulesHandler: {
            type: "sjrk.storyTelling.server.storytellingNodeModulesHandler",
            "route": "/*",
            "method": "get",
            "prefix": "/node_modules/sjrk-storytelling"
        },
        getStoryHandler: {
            type: "sjrk.storyTelling.server.getStoryHandler",
            "route": "/story/:id",
            "method": "get"
        },
        saveStoryHandler: {
            type: "sjrk.storyTelling.server.saveStoryHandler",
            "route": "/story/:id",
            "method": "post"
        },
        uiHandler: {
            type: "sjrk.storyTelling.server.staticHandler",
            "route": "/*",
            "method": "get"
        }
    }
});

fluid.defaults("sjrk.storyTelling.server.getStoryHandler", {
    gradeNames: "kettle.request.http",
    invokers: {
        handleRequest: {
            funcName: "sjrk.storyTelling.server.getStoryHandler.handleRequest",
            args: ["{request}", "{server}.dataSource"]
        }
    }
});

fluid.defaults("sjrk.storyTelling.server.saveStoryHandler", {
    gradeNames: "kettle.request.http",
    invokers: {
        handleRequest: {
            funcName: "sjrk.storyTelling.server.saveStoryHandler.handleRequest",
            args: ["{request}", "{server}.dataSource"]
        }
    }
});

sjrk.storyTelling.server.getStoryHandler.handleRequest = function (request, dataSource) {
    var id = request.req.params.id;
    var promise = dataSource.get({directStoryId: id});

    promise.then(function (response) {
        var responseAsJSON = JSON.stringify(response);
        request.events.onSuccess.fire(responseAsJSON);
    }, function (error) {
        var errorAsJSON = JSON.stringify(error);
        request.events.onError.fire({
            message: errorAsJSON
        });
    });
};

sjrk.storyTelling.server.saveStoryHandler.handleRequest = function (request, dataSource) {
    var id = request.req.params.id;
    var promise = dataSource.set({directStoryId: id}, {"title": "Story", "author": "Gregor", "content": "My content"});

    promise.then(function (response) {
        var responseAsJSON = JSON.stringify(response);
        request.events.onSuccess.fire(responseAsJSON);
    }, function (error) {
        var errorAsJSON = JSON.stringify(error);
        request.events.onError.fire({
            message: errorAsJSON
        });
    });
};

fluid.defaults("sjrk.storyTelling.server.staticHandlerBase", {
    gradeNames: "kettle.request.http",
    invokers: {
        handleRequest: {
            funcName: "kettle.request.notFoundHandler"
        }
    }
});

fluid.defaults("sjrk.storyTelling.server.staticHandler", {
    gradeNames: ["sjrk.storyTelling.server.staticHandlerBase"],
    requestMiddleware: {
        "static": {
            middleware: "{server}.ui"
        }
    }
});

fluid.defaults("sjrk.storyTelling.server.infusionNodeModulesHandler", {
    gradeNames: ["sjrk.storyTelling.server.staticHandlerBase"],
    requestMiddleware: {
        "static": {
            middleware: "{server}.infusionNodeModules"
        }
    }
});

fluid.defaults("sjrk.storyTelling.server.binderNodeModulesHandler", {
    gradeNames: ["sjrk.storyTelling.server.staticHandlerBase"],
    requestMiddleware: {
        "static": {
            middleware: "{server}.binderNodeModules"
        }
    }
});

fluid.defaults("sjrk.storyTelling.server.storytellingNodeModulesHandler", {
    gradeNames: ["sjrk.storyTelling.server.staticHandlerBase"],
    requestMiddleware: {
        "static": {
            middleware: "{server}.storytellingNodeModules"
        }
    }
});

sjrk.storyTelling.server();
