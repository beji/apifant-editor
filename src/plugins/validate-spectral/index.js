// Base validate plugin that provides a placeholder `validateSpec` that fires
// after `updateJsonSpec` is dispatched.

import { useSelector } from "react-redux";

export const updateJsonSpec = (ori, { specActions }) => (...args) => {
    ori(...args)

    const [spec] = args
    specActions.validateSpec(spec)
}

//eslint-disable-next-line no-unused-vars
export const validateSpec = (jsSpec) => (arg) => {
    // NOTE: The URL is most likely wrong for any actual use case
    // NOTE: The URL needs to use the v10 ruleset for Openapi 3.0
    fetch("http://localhost:8080/oas-validation/api/validate?ruleset=v5", {
        method: "POST",
        headers: {
            "Accept": "application/json"
        },
        body: arg.specSelectors.specStr(),
    }).then(response => response.json()).then(response => {
        const errors = response.map((entry) => {
            return {
                level: "error",
                message: entry.message,
                path: entry.path,
                line: entry.range.start.line
            }
        })
        arg.errActions.newSpecErrBatch(errors);
    }
    ).catch((error) => {
        console.error("Error:", error);
    });
}

export default function() {
    return {
        statePlugins: {
            spec: {
                actions: {
                    validateSpec,
                },
                wrapActions: {
                    updateJsonSpec
                }
            }
        }
    }
}
