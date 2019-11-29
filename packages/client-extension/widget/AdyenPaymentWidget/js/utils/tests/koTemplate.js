import fs from "fs";
import path from "path";
import ko from "knockout";
import viewModel from "../../adyen-checkout";

const cleanKoComments = (node) => {
    for (const child of node.childNodes) {
        if (child.nodeType === Node.COMMENT_NODE) {
            node.removeChild(child);
        }

        if (child.nodeType === Node.ELEMENT_NODE) {
            child.removeAttribute("data-bind");
            cleanKoComments(child);
        }
    }
}

export const mockTemplate = (templateId) => {
    const script = document.createElement("script");
    script.type = "text/html";
    script.setAttribute("id", templateId);
    script.innerHTML = `<template name="${encodeURI(templateId)}" data-bind="debugPrint: $data" />`;
    document.head.appendChild(script);
    return {
        remove() {
            document.head.removeChild(script);
        }
    }
}

const template = fs.readFileSync(path.resolve(__dirname, '../../../templates/display.template')).toString()

const generateTemplate = (widget, cb) => {
    document.body.innerHTML = template.toString();
    try {
        ko.cleanNode(document.body)
    } catch (e) {
        throw new Error(e)
    }

    viewModel.onLoad(widget)
    cb && cb(viewModel)
    ko.applyBindings(viewModel, document.body);
    cleanKoComments(document.body)
    const formattedStr = document.body.innerHTML
        .replace(/<!-- \/ko -->/g, '')
        .replace(/[\r\n]\s*/g, '');

    document.body.innerHTML = formattedStr;
    return {
        [Symbol.for("dom")]: document.body,
    };
}

export default generateTemplate