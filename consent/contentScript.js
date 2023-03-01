async function contentScriptRunner() {
    let url = location.href;
    
    let insideIframe = window !== window.parent;
    
    if(insideIframe) {
        //We are inside an iframe, request the actual tab url to check if we are active
        url = await new Promise((resolve, reject)=>{
            chrome.runtime.sendMessage("GetTabUrl", (response)=>{
                resolve(response);
            });
        });
    }
    
    url = url.substring(url.indexOf("://")+3, url.indexOf("/", 8));

    GDPRConfig.isActive(url).then(async (active) => {
        if (active) {
            chrome.runtime.sendMessage("GetRuleList", (fetchedRules)=>{
    
                GDPRConfig.getCustomRuleLists().then((customRules)=>{
                    fetchedRules.forEach((ruleObj)=>{
                        delete ruleObj["$schema"];
                    });
                    delete customRules["$schema"];
    
                    // Concat rule-lists to engine config in order
                    let config = Object.assign({}, ...fetchedRules, customRules);
    
                    GDPRConfig.getConsentValues().then((consentTypes)=>{
                        GDPRConfig.getDebugValues().then((debugValues)=>{
                            GDPRConfig.getGeneralSettings().then((generalSettings)=>{
                                if(debugValues.debugLog) {
                                    console.log("FetchedRules:", fetchedRules);
                                    console.log("CustomRules:", customRules);
                                }
                
                                ConsentEngine.debugValues = debugValues;
                                ConsentEngine.generalSettings = generalSettings;
                                ConsentEngine.topFrameUrl = url;
        
                                chrome.runtime.sendMessage("Searching");

                                let engine = new ConsentEngine(config, consentTypes, (evt)=>{
                                    let result = {
                                        "handled": evt.handled
                                    };

                                    if(evt.handled) {
                                        result.cmp = evt.cmpName;
                                        result.clicks = evt.clicks;
                                        result.url = url;
    
                                        chrome.runtime.sendMessage("HandledCMP|"+JSON.stringify(result));
                                    } else if(evt.error) {
                                        chrome.runtime.sendMessage("CMPError");
                                    } else {
                                        chrome.runtime.sendMessage("NothingFound");
                                    }
                                });
        
                                ConsentEngine.singleton = engine;
        
                                if(debugValues.debugLog) {
                                    console.log("ConsentEngine loaded " + engine.cmps.length + " of " + Object.keys(config).length + " rules");
                                }
                            });
                        });
                    });
                });
            });
        }
    });
}

window.consentScrollBehaviours = {};
function getCalculatedStyles() {
    ["html","html body"].forEach(element=>{
        let node = document.querySelector(element);
        if (node) {
            let styles = window.getComputedStyle(node);
            window.consentScrollBehaviours[element+".consent-scrollbehaviour-override"] = ["position","overflow","overflow-y"].map(property=>{
                return {property:property, value:styles[property]}
            });
        }
    });
}

let observer = new MutationObserver((mutations)=>{
    mutations.forEach((mutation)=>{
        mutation.addedNodes.forEach((node)=>{
            if(node.matches != null && node.matches("body")) {
                getCalculatedStyles();
                observer.disconnect();
            }
        })
    });
});

observer.observe(document.querySelector("html"), {
    childList: true
});

window.addEventListener("message", (event)=>{
    try {
        if(event.data.enforceScrollBehaviours != null) {
            ConsentEngine.enforceScrollBehaviours(event.data.enforceScrollBehaviours);
        }
    }catch(e) {
        console.error("Error inside message listener:", e);
    }
});

contentScriptRunner().catch((e)=>{
    console.error(e);
});