import { h } from "../lib/dom.js";

import { evaluateExpression } from "../lib/utils.js";

export function CalculatorApp({payload: payload, onUpdate: onUpdate}) {
  const keys = [ "C", "⌫", "%", "÷", "7", "8", "9", "×", "4", "5", "6", "−", "1", "2", "3", "+", "0", ".", "=" ];
  function livePreview(expression) {
    if (!expression) return "0";
    const value = evaluateExpression(expression);
    return value === "Errore" ? payload.result : value;
  }
  function press(key) {
    if (key === "C") return onUpdate({
      expression: "",
      result: "0"
    });
    if (key === "⌫") {
      const expression = payload.expression.slice(0, -1);
      return onUpdate({
        expression: expression,
        result: livePreview(expression)
      });
    }
    if (key === "=") return onUpdate({
      expression: payload.expression,
      result: evaluateExpression(payload.expression)
    });
    const next = `${payload.expression}${key.replace("×", "*").replace("÷", "/").replace("−", "-")}`;
    return onUpdate({
      expression: next,
      result: livePreview(next)
    });
  }
  return h("div", {
    className: "calculator-app"
  }, h("div", {
    className: "calculator-display"
  }, h("div", {
    className: "calculator-expression"
  }, payload.expression || "0"), h("div", {
    className: "calculator-result"
  }, payload.result || "0")), h("div", {
    className: "calculator-grid"
  }, keys.map(key => h("button", {
    type: "button",
    key: key,
    className: `calculator-key ${[ "C", "⌫", "%" ].includes(key) ? "calculator-key--muted" : ""} ${key === "=" ? "calculator-key--accent" : ""}`,
    onClick: () => press(key)
  }, key))));
}
