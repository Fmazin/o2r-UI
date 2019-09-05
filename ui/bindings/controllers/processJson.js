const rules = require('./rules');
const fn = require('./generalFunctions');
const debug = require('debug')('bindings');


let pJ = {};


pJ.addFileContentToJson = function (jsonObj) {
    debug('Add file content to json');
    let processedJson = [];
    let numberOfLoopRuns = 0;
    for (let i = 0; i < jsonObj.Lines.length; i++) {
        if (jsonObj.Lines[i].type == 'function') {
            debug('function');
            let fun = rules.processFunction(jsonObj.Lines, i);
            processedJson.push(fun);
            i = fun.end;
        } else if (jsonObj.Lines[i].type == 'conditional') {
            debug('cond');
            let cond = rules.processCond(jsonObj.Lines, i);
            processedJson.push(cond);
            i = cond.end
        } else if (jsonObj.Lines[i].type == 'forLoop' || jsonObj.Lines[i].type == 'whileLoop' || jsonObj.Lines[i].type == 'repeatLoop') {
            debug('loop');
            let loop = rules.processLoop(jsonObj.Lines, i);
            processedJson.push(loop);
            i = loop.end
        } else if (jsonObj.Lines[i].type == 'inlineFunction') {
            debug('ILFunction');
            let inline = rules.processInlineFunction(jsonObj.Lines, i);
            processedJson.push(inline);
        } else if (jsonObj.Lines[i].type == 'variable') {
            debug('var');
            let variable = rules.processVariables(jsonObj.Lines, i, false);
            if (variable.multi == false) {
                processedJson.push(variable);
            } else {
                processedJson.push(variable);
                i = variable.end
            }
        } else if (jsonObj.Lines[i].type == 'variable call') {
            let varCall = rules.processVarCall(jsonObj.Lines, i);
            debug('VC ');
            processedJson.push(varCall);
        } else if (jsonObj.Lines[i].type == 'library') {
            debug('lib');
            let lib = rules.processLib(jsonObj.Lines, i);
            processedJson.push(lib);
        } else if (jsonObj.Lines[i].type == 'exFile') {
            debug('exFile');
            let exFile = rules.processExFile(jsonObj.Lines, i);
            processedJson.push(exFile);
        } else if (jsonObj.Lines[i].type == 'sequence') {
            debug('seq');
            let seq = rules.processSequence(jsonObj.Lines, i);
            processedJson.push(seq);
        }
        numberOfLoopRuns++;
    }
    return processedJson;
};

pJ.getVarsAndValuesOfLines = function (processedJson) {
    debug('Get vars and values');
    let varsAndValues = [];
    for (let i = 0; i < processedJson.length; i++) {
        if (processedJson[i].json.type == 'function') {
            debug('function');
            let start = processedJson[i].index
            let end = processedJson[i].endIndex
            let vars = ['']
            let type = processedJson[i].json.type
            let name = processedJson[i].json.content.name
            let codeBlock = processedJson[i].json.codeBlock
            varsAndValues.push({
                start,
                end,
                vars,
                type,
                name,
                codeBlock
            })

        } else if (processedJson[i].json.type == 'conditional') {
            let start = processedJson[i].json.index
            let end = processedJson[i].endIndex;
            let vars = pJ.getVarsOfCond(processedJson[i].json);
            let type = processedJson[i].json.type
            let name = rules.getContentInBrackets(processedJson[i].json.value)[0]
            let codeBlock = processedJson[i].json.codeBlock
            varsAndValues.push({
                start,
                end,
                vars,
                type,
                name,
                codeBlock
            })

        } else if (processedJson[i].json.type == 'forLoop' || processedJson[i].json.type == 'whileLoop' || processedJson[i].json.type == 'repeatLoop') {
            debug('loop');

        } else if (processedJson[i].json.type == 'inlineFunction') {
            debug('ILFunction');
            let start = processedJson[i].index
            let end = processedJson[i].index
            let vars = pJ.getVarsOfInlineFunctions(processedJson[i].json.value)
            let type = processedJson[i].json.type
            let name = processedJson[i].json.call
            let codeBlock = processedJson[i].json.codeBlock
            varsAndValues.push({
                start,
                end,
                vars,
                type,
                name,
                codeBlock
            })
        } else if (processedJson[i].json.type == 'variable') {
            debug('var');
            let end;
            let start = processedJson[i].index
            if (processedJson[i].multi == false) {
                end = processedJson[i].index
            } else {
                end = processedJson[i].endIndex;
            }
            let vars = pJ.getVarsOfVariables(processedJson[i].json);
            debug('varslog')
            let type = processedJson[i].json.type
            let name = processedJson[i].json.content[0].variable
            let codeBlock = processedJson[i].json.codeBlock
            varsAndValues.push({
                start,
                end,
                vars,
                type,
                name,
                codeBlock
            })

        } else if (processedJson[i].json.type == 'variable call') {
            debug('varCall');
            let start = processedJson[i].index
            let end = processedJson[i].index
            let vars = [processedJson[i].json.content.value]
            let type = processedJson[i].json.type
            let name = processedJson[i].json.content.value
            let codeBlock = processedJson[i].json.codeBlock
            varsAndValues.push({
                start,
                end,
                vars,
                type,
                name,
                codeBlock
            })
        } else if (processedJson[i].json.type == 'library') {
            debug('lib');
            let start = processedJson[i].index
            let end = processedJson[i].index
            let vars = ['']
            let type = processedJson[i].json.type
            let name = processedJson[i].json.content[0]
            let codeBlock = processedJson[i].json.codeBlock
            varsAndValues.push({
                start,
                end,
                vars,
                type,
                name,
                codeBlock
            })


        } else if (processedJson[i].type == 'exFile') {
            debug('exFile');

        } else if (processedJson[i].type == 'sequence') {
            debug('seq');

        }
    }
    return varsAndValues;
}

pJ.getVarsOfInlineFunctions = function (LineWithTypeInlineFunction) {
    let inlineFunVars = "";
    if (LineWithTypeInlineFunction.indexOf('#') == -1) {
        let contentInBrackets = rules.getContentInBrackets(LineWithTypeInlineFunction);
        for (let i = 0; i < contentInBrackets.length; i++) {
            if (isNaN(contentInBrackets[i]) == true) {
                inlineFunVars = contentInBrackets;
            }
        }
    } else {
        let contentString = LineWithTypeInlineFunction;
        let values = contentString.substring(0, indexOf('#'))
        if (values.indexOf('(') != -1 && values.indexOf(')') != -1) {
            let varsInBrackets = rules.getContentInBrackets(values);
            for (let i = 0; i < varsInBrackets.length; i++) {
                if (isNaN(varsInBrackets[i]) == true) {
                    inlineFunVars = varsInBrackets;
                }
            }
        }
    }
    return inlineFunVars;
}

pJ.getVarsOfVariables = function (LineWithTypeVariable) {
    let vars = [];
    for (let i = 0; i < LineWithTypeVariable.content.length; i++) {
        let variable = LineWithTypeVariable.content[i].variable;
        if (variable.indexOf('#') != -1) {
            let varWithoutComment = variable.substring(0, variable.indexOf('#'))
            vars.push(varWithoutComment);
        } else {
            vars.push(variable);
        }
        if (LineWithTypeVariable.content[i].type == 'inlineFunction') {
            let inlineFun = pJ.getVarsOfInlineFunctions(LineWithTypeVariable.content[i].value);
            if (inlineFun.constructor === Array) {
                vars = vars.concat(inlineFun);
            } else {
                vars.push(inlineFun);
            }

        } else {
            let contentString = LineWithTypeVariable.content[i].value;
            if (contentString.indexOf('#') == -1) {
                if (isNaN(contentString) == true) {
                    vars.push(contentString);
                }
            } else {
                let value = contentString.substring(0, contentString.indexOf('#'))
                if (isNaN(value) == true) {
                    vars.push(value);
                }
            }

        }
    }
    return vars;
}
//TODO: Finish cond processing --> Only works for forLoops and variables
pJ.getVarsOfCond = function (LineWithTypeCond) {
    let vars = [];
    let condVar = rules.getContentInBrackets(LineWithTypeCond.value);
    for (let i = 0; i < condVar.length; i++) {
        vars.push(condVar[i]);
    }
    for (let i = 0; i < LineWithTypeCond.content.length; i++) {
        if (LineWithTypeCond.content[i].type == 'variable') {
            let varValue = pJ.getVarsOfVariables(LineWithTypeCond.content[i].value.json);
            console.log('varValue');
            console.log(varValue);
            vars = vars.concat(varValue);

        } else if (LineWithTypeCond.content[i].type == 'forLoop') {
            let varValue = pJ.getVarsOfLoops(LineWithTypeCond.content[i].value.json, 'forLoop');
            console.log('varValueLoop');
            console.log(varValue);
            vars = vars.concat(varValue);
        }
    }
    return vars;
}
//TODO: Extent Loop processing to all, not only vars
pJ.getVarsOfLoops = function (LineWithTypeLoop, loopType) {
    let vars = [];
    if (loopType == 'forLoop') {
        for (let i = 0; i < LineWithTypeLoop.content.length; i++) {
            if (LineWithTypeLoop.content[i].type == 'variable') {
                let varValue = pJ.getVarsOfVariables(LineWithTypeLoop.content[i].value.json);
                console.log('varValueInForLoop');
                console.log(varValue);
                vars = vars.concat(varValue);

            }
        }
    }
    return vars;
}

//TODO: Add lines to find all plot functions in script --> not needed for now
pJ.findPlotLines = function (jsonObj, plotFunctions) {
    let plotFunctionsToFind = fn.readFile(plotFunctions);
    let lines = plotFunctionsToFind.split(/\r?\n/);
};




processJsonTypesFromInlineFunction = function (jsonObj) {
    let type = jsonObj.content.type;
    let value = jsonObj.content.args.value;
    for (let i = 0; i < value.length; i++) {
        if (type[i] == 'variable call') {
            if (value[i].indexOf('=') != -1) {
                value = value[i].substring(0, value[i].indexOf('='))
            }
            if (value[i].indexOf('<') != -1) {

            }
            jsonObj.variables = value;
        }
    }
    return jsonObj;
};


pJ.ProcessNestedCont = function (jsonObj) {
    //console.log(allKeys(jsonObj));
    //console.log(JSON.stringify(jsonObj));
    let loopsAndFun = ['forLoop', 'whileLoop', 'repeatLoop', 'conditional', 'function', 'inlineFunction'];

    for (let i = 0; i < jsonObj.Lines.length; i++) {
        if (!loopsAndFun.includes(jsonObj.Lines[i].type)) {
            if (jsonObj.Lines[i].content.value != undefined) {
                processJsonTypeWithoutLoopsAndConds(jsonObj, jsonObj.Lines[i].content.type);
            }
        }
        if (jsonObj.Lines[i].type == 'inlineFunction') {
            if (jsonObj.Lines[i].content.args.value instanceof Object) {
                processJsonTypesFromInlineFunction(jsonObj.Lines[i])
            }
        }
        if (loopsAndFun.includes(jsonObj.Lines[i].type)) {
            //get variables of loops

        }
    }
    return jsonObj;
};

pJ.valuesToSearchFor = function (plotFunction) {
    let valuesForSearch = rules.getContentInBrackets(plotFunction);
    return valuesForSearch;
}


pJ.getAllCodeLines = function (processedJson, varToSearchFor, lines) {
    let plotFunctions = ['lines', 'plot', 'axis', 'mtext', 'legend', 'par'];
    let libAndFun = ['library', 'function']
    if (lines.length == 0) {
        processedJson.forEach(line => {
            if (plotFunctions.some(fun => line.name.includes(fun)) || libAndFun.some(fun => line.type.includes(fun))) {
                lines.push({
                    start: line.start,
                    end: line.end,
                    codeBlock: line.codeBlock
                });
                let start = line.start;
                let end = line.end;
                processedJson = processedJson.filter(entry => entry.end != end && entry.start != start);
            }
        })
    }
    let search = [];
    varToSearchFor.forEach(entry => {
        let expression = new RegExp('\\b' + entry + '\\b');
        search.push(expression);

    })
        processedJson.forEach((line) => {
            if (line.vars.some(rx => search.some(elem => elem.test(rx)))) {
                lines.push({
                    start: line.start,
                    end: line.end,
                    codeBlock: line.codeBlock
                });
                if (line.vars.length > 1) {
                    let index = line.vars.indexOf(varToSearchFor);
                    line.vars.splice(index, 1);
                    let nextValues = line.vars;
                    pJ.getAllCodeLines(processedJson, nextValues, lines);
                }

            }
        });
    lines = lines.reduce((noDups, entry) => {
        if (!noDups.some(object => object.start === entry.start && object.end === entry.end)) {
            noDups.push(entry);
        }
        return noDups;
    }, []);

    return lines.sort((a, b) => (a.start > b.start) ? 1 : -1);
};


pJ.getCodeLines = function (codeLines) {
    debug('Extract code lines');
    let codeLinesOfValues = [];

    const min = codeLines.reduce(
        (minValue, codeLine) => (codeLine.start < minValue ? codeLine.start : minValue), Number.MAX_SAFE_INTEGER);
    const max = codeLines.reduce(
        (maxValue, codeLine) => (codeLine.end > maxValue ? codeLine.end : maxValue), 0);

    codeLinesOfValues.push({
        start: min,
        end: max
    })
    return codeLinesOfValues;
}

module.exports = pJ;