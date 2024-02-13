import './styles/App.css';
import Plotly from 'plotly.js-dist';
import { create, all } from 'mathjs'
import React, { useState, useEffect, useRef } from 'react';

function Expression() {
  this.formula = "";
  this.variable = false;

  const testVariable = (formula) => {
    const variableTest = new RegExp('(?<![xy])\\b[a-wz]+\\s*=\\s*-?\\d+\\s*(?:[*/]\\s*-?\\d+)?\\b');

    if(variableTest.test(formula)){
      this.variable = true;
    } else {
      this.variable = false;
    }
  }

  this.setFormula = (formula) => {
    this.formula = formula;

    testVariable(formula);
  }

  this.calculateFormula = (scope = {}) => {
    const config = { };
    const math = create(all, config);
    const data = {x: [], y: [], mode: "", name: ""}

    try {
      let xValues = [];
      let yValues = [];

      for (let x = -10; x <= 10; x += 0.1){
        xValues.push(x);
        scope.x = x;
        yValues.push(math.evaluate(this.formula, scope));
      }

        data.x = xValues;
        data.y = yValues;
        data.type = "scatter";
        data.mode = "lines";
        data.name = "f(x) = " + this.formula;
      }
      catch (error){
        console.log("Can't evaluate because:" + error);
      }

      return data; //Return data for Chart
  }
}

function App() {
  const [expressions, setExpressions] = useState([]); //List of objects Expression
  const plotRef = useRef(null); //Ref for display Chart

  const createExpression = () => {
    const newExpression = new Expression();
    setExpressions([...expressions ,newExpression]);

    console.log("Create expression with ID:", expressions.length + 1);
  };

  const handleFormulaChange = (index, event) => {
    const newExpressions = [...expressions];
    newExpressions[index].setFormula(event.target.value);
    setExpressions(newExpressions);

    console.log("Index:", index);
    console.log("Formula:", newExpressions[index].formula);
    console.log("Variable?:", newExpressions[index].variable);
  };

  const deleteExpression = (index) => {
    const newExpressions = [...expressions];
    newExpressions.splice(index, 1);
    setExpressions(newExpressions);

    console.log("Deleted Expression Index: " + index);
  };

  useEffect(() => {
    const dataChart = [];
    const variables = {};

    const expressionVariables = expressions.filter((expression) => expression.variable);
    const expressionFormulas = expressions.filter((expression) => !expression.variable);

    try{
      expressions.map((expression) => {
        if(!expression.variable){
          dataChart.push(expression.calculateFormula(variables));
        } else {
          const variableSplited = expression.formula.split("=").map(part => part.trim());
          variables[variableSplited[0]] = variableSplited[1];
          console.log(variableSplited[0] + " " + variableSplited[1]);
        }
      });
    }
    catch{
      console.log("Expressions don't exist");
    }

    const layout = {
      title: 'Sample Line Chart'
    };

    Plotly.newPlot(plotRef.current, dataChart, layout);

    return () => {
      Plotly.purge(plotRef.current);
    };
  }, [expressions]);

  return (
    <div className="App" class = "w3-row">
      <div class = "w3-col s12 m4 l4 w3-border-right w3-border-black">
        <div class="w3-bar w3-red w3-theme-d5">
          <button class="w3-button w3-bar-item w3-right"><i class="material-icons">add</i>var.</button>
          <button onClick={createExpression} class="w3-button w3-bar-item w3-right"><i class="material-icons">add</i>f(x)</button>
        </div>
          <div style={{height: '92.5vh', overflow: 'scroll'}}>
            {expressions.map((expression, index) =>
            <div key={index}>
              <input onChange={(event) => handleFormulaChange(index, event)}
                class="w3-input" type="text"
                placeholder="x*2 (x is necessary)"
                value={expression.formula}/>
              <span onClick={() => deleteExpression(index)} class="w3-button w3-right">&times;</span>
            </div>
            )}
          </div>
      </div>
      <div class = "w3-col s12 m8 l8 w3-blue">
        <div ref={plotRef} />
      </div>
    </div>
  );
}

export default App;
