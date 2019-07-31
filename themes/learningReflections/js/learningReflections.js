/*
Copyright 2018-2019 OCAD University
Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid */

"use strict";

(function ($, fluid) {

    // Provides the Learning Reflections framing to the Storytelling Tool
    fluid.defaults("sjrk.storyTelling.learningReflections.page", {
        gradeNames: ["sjrk.storyTelling.base.page"],
        distributeOptions: [{
            target: "{that > menu > templateManager}.options.templateConfig.templatePath",
            record: "%resourcePrefix/templates/learningReflections-menu.handlebars"
        },
        {
            target: "{that > masthead > templateManager}.options.templateConfig",
            record: {
                messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                templatePath: "%resourcePrefix/templates/learningReflections-masthead.handlebars"
            }
        },
        {
            target: "{that > footer > templateManager}.options.templateConfig",
            record: {
                messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                templatePath: "%resourcePrefix/templates/learningReflections-footer.handlebars"
            }
        }],
        components: {
            masthead: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-page-header-container"
            },
            footer: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-page-footer-container",
                options: {
                    components: {
                        templateManager: {
                            options: {
                                model: {
                                    dynamicValues: {
                                        resourcePrefix: "{that}.options.templateConfig.resourcePrefix"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Applies the Learning Reflections shell to the storyView page
    fluid.defaults("sjrk.storyTelling.learningReflections.page.storyView", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page", "sjrk.storyTelling.base.page.storyView"],
        distributeOptions: {
            target: "{that > storyViewer > templateManager}.options.templateConfig.templatePath",
            record: "%resourcePrefix/templates/learningReflections-storyViewer.handlebars"
        }
    });

    // Applies the Learning Reflections shell to the storyBrowse page
    fluid.defaults("sjrk.storyTelling.learningReflections.page.storyBrowse", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page", "sjrk.storyTelling.base.page.storyBrowse"],
        distributeOptions: {
            target: "{that > storyBrowser > templateManager}.options.templateConfig.templatePath",
            record: "%resourcePrefix/templates/learningReflections-storyBrowser.handlebars"
        },
        components: {
            storyBrowser: {
                options: {
                    browserConfig: {
                        placeholderThumbnailUrl: "src/img/icons/Book.svg"
                    }
                }
            }
        }
    });

    // Applies the Learning Reflections shell to the storyEdit page
    fluid.defaults("sjrk.storyTelling.learningReflections.page.storyEdit", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page", "sjrk.storyTelling.base.page.storyEdit"],
        distributeOptions: [{
            target: "{that > storyEditor > templateManager}.options.templateConfig.templatePath",
            record: "%resourcePrefix/templates/learningReflections-storyEditor.handlebars"
        },
        {
            target: "{that > storyPreviewer > templateManager}.options.templateConfig.templatePath",
            record: "%resourcePrefix/templates/learningReflections-storyViewer.handlebars"
        }]
    });

    fluid.defaults("sjrk.storyTelling.learningReflections.page.introduction", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page"],
        distributeOptions: [{
            target: "{that > introduction > templateManager}.options.templateConfig",
            record: {
                messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                templatePath: "%resourcePrefix/templates/learningReflections-introduction.handlebars"
            }
        }],
        components: {
            introduction: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-introduction"
            }
        }
    });

    fluid.defaults("sjrk.storyTelling.learningReflections.page.workshops", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page"],
        distributeOptions: [{
            target: "{that > workshops > templateManager}.options.templateConfig",
            record: {
                messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                templatePath: "%resourcePrefix/templates/learningReflections-workshops.handlebars"
            }
        }],
        components: {
            workshops: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-workshops"
            }
        }
    });

    fluid.defaults("sjrk.storyTelling.learningReflections.page.resources", {
        gradeNames: ["sjrk.storyTelling.learningReflections.page"],
        distributeOptions: [{
            target: "{that > resources > templateManager}.options.templateConfig",
            record: {
                messagesPath: "%resourcePrefix/messages/learningReflectionMessages.json",
                templatePath: "%resourcePrefix/templates/learningReflections-resources.handlebars"
            }
        }],
        components: {
            resources: {
                type: "sjrk.storyTelling.ui",
                container: ".sjrkc-st-resources"
            }
        }
    });

})(jQuery, fluid);