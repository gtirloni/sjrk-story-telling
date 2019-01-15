/*
Copyright 2018 OCAD University
Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid, sjrk */

(function ($, fluid) {

    "use strict";

    // a UI for listing and browsing stories
    fluid.defaults("sjrk.storyTelling.ui.storyBrowser", {
        gradeNames: ["sjrk.storyTelling.ui"],
        model: {
            // the list of stories to be browsed (actually just models)
            stories: {
                // This content is here to aid in work on styling/aesthetics
                // story1: {
                //     title: "First story about something",
                //     author: "First Author",
                //     tags: ["Heart","Book"],
                //     contentTypes: ["text","image"]
                // },
                // story2: {
                //     title: "Second story about other things",
                //     author: "Second Author",
                //     tags: ["Cats"]
                // },
                // story3: {
                //     title: "Third story to try out a different thumbnail image",
                //     tags: ["Dots","Yayoi Kusama"],
                //     thumbnailUrl: "/tests/img/obliterationroom.jpg"
                // },
                // story4: {
                //     title: "Fourth story",
                //     author: "Fourth Author"
                // },
                // story5: {
                //     title: "Fifth story",
                //     tags: ["Dots"],
                //     thumbnailUrl: "/tests/img/obliterationroom.jpg"
                // }
            }
        },
        selectors: {
            linkList: ".sjrkc-st-browser-view-control-container",
            viewList: ".sjrkc-st-browser-stories",
            gridViewLink: ".sjrkc-st-browser-view-control-grid",
            listViewLink: ".sjrkc-st-browser-view-control-list"
        },
        events: {
            onViewChangeRequested: null,
            onViewChanged: null
        },
        listeners: {
            "onReadyToBind.bindGridViewRequest": {
                "this": "{that}.dom.gridViewLink",
                "method": "click",
                "args": ["grid", "{that}.events.onViewChangeRequested.fire"]
            },
            "onReadyToBind.bindListViewRequest": {
                "this": "{that}.dom.listViewLink",
                "method": "click",
                "args": ["list", "{that}.events.onViewChangeRequested.fire"]
            },
            "onViewChangeRequested.changeView": {
                func: "{that}.changeView",
                args: ["{arguments}.0.data"]
            }
        },
        browserConfig: {
            placeholderThumbnailUrl: "../img/icons/icon-globe.png",
            gridViewClassName: "grid"
        },
        invokers: {
            changeView: {
                "funcName": "sjrk.storyTelling.ui.storyBrowser.changeView",
                args: ["{that}",
                    "viewList",
                    "{arguments}.0",
                    "{that}.options.browserConfig.gridViewClassName",
                    "{that}.events.onViewChanged"]
            }
        },
        components: {
            templateManager: {
                options: {
                    listeners: {
                        "onAllResourcesLoaded.renderTemplate": {
                            funcName: "{that}.renderTemplate",
                            args: ["{storyBrowser}.model", "{storyBrowser}.options.browserConfig"]
                        }
                    },
                    templateConfig: {
                        templatePath: "%resourcePrefix/src/templates/storyBrowser.handlebars"
                    }
                }
            }
        }
    });

    sjrk.storyTelling.ui.storyBrowser.changeView = function (component, selector, displayPreference, className, completionEvent) {
        if (displayPreference === "grid") {
            component.locate(selector).addClass(className);
            component.locate("linkList").addClass(className);
        } else {
            component.locate(selector).removeClass(className);
            component.locate("linkList" ).removeClass(className);
        }

        completionEvent.fire();
    };

})(jQuery, fluid);
