import './styles/App.css';
import Plotly from 'plotly.js-dist';
import { create, all, expression } from 'mathjs'
import React, { useState, useEffect, useRef } from 'react';

function Expression(){
  this.expression = "";
  this.dependencies = [];
  this.type = "";
  this.specialSymbol = "";

  const setSpecialSymbol = (symbol) => this.specialSymbol = symbol;

  this.setExpression = (inputExpression) => this.expression = inputExpression;
  this.setDependencies = (dependencies) => this.dependencies = dependencies;

  this.determineType = (inputExpression) => {
  //Types: linearFun; equationFun; linearVar; equationVar;
    const expression = inputExpression;
    let specialSymbol;

    try{
    if(expression.includes("=")){
      let split = expression.split("=");
      let splitTrim = split[0].trim();

      if(expression.includes("x") || expression.includes("y")){
        if(splitTrim.length === 1){
          this.type = "linearFun"
        } else if(splitTrim.length > 1){
          this.type = "equationFun"
        }

        setSpecialSymbol("y");
      } else {
        if(splitTrim.length === 1){
          this.type = "linearVar"
        } else if(splitTrim.length > 1 && expression.includes("$")){
          specialSymbol = expression.split("$");
          setSpecialSymbol(specialSymbol[1]);
          this.type = "equationVar";
        }
      }
    } else {
      this.type = "linearFun";
      console.log(this.type);
    }
    } catch(error) {
      console.log(error);
    }
  };

  this.getExpression = () => this.expression;
  this.getDependencies = () => this.dependencies;
  this.getType = () => this.type;
  this.getSpecialSymbol = () => this.specialSymbol;
}

function DataPrototype(){
  this.x = [];
  this.y = [];
  this.mode = "lines";
  this.name = "";

  this.setXandY = (x, y) => {
    this.x.push(x);
    this.y.push(y);
  }

  this.setMode = (mode) => {
    this.mode = mode;
  }

  this.setName = (name) => {
    this.name = name;
  }
}

function App() {
  var nerdamer = require('nerdamer');

  require('nerdamer/Algebra');
  require('nerdamer/Calculus');
  require('nerdamer/Solve');
  require('nerdamer/Extra');

  const config = { };
  const math = create(all, config);
  const parser = math.parser();

  const [expressions, setExpressions] = useState([]); //List of Expression
  const [rangeAndStepX, setRangeAndStepX] = useState([-10, 10, 0.1]); // 0 - minX 1-maxX 2-stepX
  const plotRef = useRef(null); //Ref for display Chart

  const createExpression = () => {
    const newExpression = new Expression();
    setExpressions([...expressions ,newExpression]);

    console.log("Create expression with ID:", expressions.length + 1);
  };

  const handleFormulaChange = (index, event) => {
    const inputExpression = event.target.value;
    const newExpressions = [...expressions];

    newExpressions[index].setExpression(inputExpression);
    newExpressions[index].determineType(inputExpression);

    setExpressions(newExpressions);

    console.log(expressions);

    console.log("Formula: " +  newExpressions[index].getExpression() + " Dependencies: " + newExpressions[index].getDependencies() + " Type: " + newExpressions[index].getType() + " Special Symbol: " + newExpressions[index].getSpecialSymbol());
  };

  const deleteExpression = (index) => {
    const newExpressions = [...expressions];

    newExpressions.splice(index, 1);

    setExpressions(newExpressions);

    console.log("Deleted Expression Index: " + index);
  };

  const calculateData = (arrayExpression = []) => {
    const dataChart = [];

    try{
    arrayExpression.map((expression) => {
      switch(expression.getType()){
        case "linearVar":{
          let a = parser.evaluate(expression.getExpression());
          console.log(a);
          break;
        }
        case "equationVar":{
          let uncorrectedExpression = expression.getExpression();
          let correctedExpression = uncorrectedExpression.split("$");

          let a = nerdamer(correctedExpression[0], parser.getAll());
          let sol = nerdamer.solveEquations(a.toString(), expression.getSpecialSymbol());
          console.log(sol.toString());
          break;
        }
        case "linearFun":{
          let y = parser.evaluate(expression.getExpression());
          console.log(y);
          break;
        }
        case "equationFun":{
          let a = nerdamer(expression.getExpression(), parser.getAll());
          let sol = nerdamer.solveEquations(a.toString(), 'y');
          console.log(sol.toString());
          break;
        }
      }
    })
    } catch(error) {
      console.log(error);
    }

    return dataChart;
  }

  useEffect(() => { //Function for display chart
    let config = {responsive: true};

    let layout = {};

    calculateData(expressions);

    const dataChart = {};

    Plotly.newPlot(plotRef.current, dataChart, layout, config);

    return () => {
      Plotly.purge(plotRef.current);
    };
  }, [expressions, rangeAndStepX]);

  return (
    <div className="App" class = "w3-row">
      <div class = "w3-col s12 m4 l4 w3-border-right w3-border-black" style={{height: '100vh'}}>
        <div class="w3-bar w3-red w3-theme-d5">
          <button onClick={createExpression} class="w3-button w3-bar-item w3-right"><i class="material-icons">add</i></button>
        </div>
          <div style={{height: '92.5vh' ,overflow: 'scroll'}}>
            {expressions.map((expression, index) =>
            <div key={index}>
              <input onChange={(event) => handleFormulaChange(index, event)}
                class="w3-input" type="text"
                placeholder="x*2 (x is necessary)"
                value={expression.expression}/>
              <span onClick={() => deleteExpression(index)} class="w3-button w3-right">&times;</span>
            </div>
            )}
          </div>
      </div>
      <div class = "w3-col s12 m8 l8 w3-blue">
        <div ref={plotRef} id="chartView" style={{height: '100vh'}} />
      </div>
    </div>
  );
}

export default App;
