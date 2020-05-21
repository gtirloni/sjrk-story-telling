/*
For copyright information, see the AUTHORS.md file in the docs directory of this distribution and at
https://github.com/fluid-project/sjrk-story-telling/blob/master/docs/AUTHORS.md

Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid */

"use strict";

(function ($, fluid) {

    // an editing interface for individual media blocks
    fluid.defaults("sjrk.storyTelling.blockUi.editor.mediaBlockEditor", {
        gradeNames: ["sjrk.storyTelling.blockUi.editor.withFileUploader", "sjrk.storyTelling.blockUi.timeBased"],
        components: {
            // the block's templateManager
            templateManager: {
                options: {
                    templateConfig: {
                        templatePath: "%resourcePrefix/templates/storyBlockMediaEdit.handlebars"
                    }
                }
            },
            // binds the DOM to infusion model endpoints
            binder: {
                options: {
                    selectors: {
                        mediaAltText: ".sjrkc-st-block-media-alt-text",
                        mediaDescription: ".sjrkc-st-block-media-description"
                    },
                    bindings: {
                        mediaAltText: "alternativeText",
                        mediaDescription: "description"
                    }
                }
            }
        }
    });

})(jQuery, fluid);
