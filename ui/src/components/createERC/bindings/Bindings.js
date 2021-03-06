import React, { Component } from 'react';
import {
  makeStyles, Stepper, Step, StepLabel, StepContent, Button,
  Typography, Paper, RadioGroup, FormControl, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@material-ui/core";
import ChipInput from 'material-ui-chip-input';

import httpRequests from '../../../helpers/httpRequests';
import Manipulate from '../../erc/Manipulate/Manipulate';
import ComputationalResult from './ComputationalResult/ComputationalResult';
import ParamResult from './ParamResult/ParamResult';
import SliderSetting from './SliderSetting/SliderSetting';
import WidgetSelector from './WidgetSelector/WidgetSelector';
import './bindings.css';
import { parse as RParse } from '../../../helpers/programm-analysis/R';
import { slice } from '../../../helpers/programm-analysis/es6/slice'
import { valid2 } from '../requiredMetadata/Form.js'

const useStyles = makeStyles(theme => ({
  root: {
    width: '90%',
  },
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  connectorActive: {
    '& $connectorLine': {
      borderColor: theme.palette.secondary.main,
    },
  },
  connectorCompleted: {
    '& $connectorLine': {
      borderColor: theme.palette.primary.main,
    },
  },
  connectorDisabled: {
    '& $connectorLine': {
      borderColor: theme.palette.grey[100],
    },
  },
  connectorLine: {
    transition: theme.transitions.create('border-color'),
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '90%',
  },
  numField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '20%',
  },
}));

function VerticalLinearStepper(props) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Which figure should be made interactive?',
    'Select the parameter which should be made possible to change',
    'Configure a UI widget'];
  const [result, setResult] = React.useState();
  const [widget, setWidget] = React.useState('slider');
  const [disabled, disable] = React.useState(true);
  const [disabled2, disable2] = React.useState(true);
  const [parameter, setParameter] = React.useState(null);
  //const plot = props.tmpPlotFunction;
  /*if (plot !== '' && disabled && activeStep === 1) {
    disable(false);
  }*/


  if (parameter !== '' && disabled && activeStep === 2 && props.parameter.length !== 0) {
    disable(false);
  }


  if (activeStep === 2 && props.tmpParam[0]&& props.tmpParam[0].uiWidget && props.tmpParam[0].uiWidget.type === "slider") {

    if ((props.tmpParam[0].uiWidget.minValue || props.tmpParam[0].uiWidget.minValue === 0) && props.tmpParam[0].uiWidget.caption && (props.tmpParam[0].uiWidget.maxValue || props.tmpParam[0].uiWidget.minValue === 0) && props.tmpParam[0].uiWidget.stepSize) {
      if (disabled2) {
        disable2(false)
      }
    }
    else if (!disabled2) {
      disable2(true)
    }
  }
  else if (activeStep === 2 && props.tmpParam[0] && props.tmpParam[0].uiWidget && props.tmpParam[0].uiWidget.type === "radio" && props.tmpParam[0].uiWidget.options) {
    if (props.tmpParam[0].uiWidget.options.length > 1 && props.tmpParam[0].uiWidget.caption) {
      if (disabled2) {
        disable2(false)
      }
    }
    else if (!disabled2) {
      disable2(true)
    }
  }


  //const handlePlotChange = () => disable(false);
  const handleSlider = (val, field) => props.setWidget(field, val, widget);
  const handleWidgetChange = (e) => setWidget(e.target.value);

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
    props.setStep(activeStep + 1);
    disable(true);
    if (activeStep === 1) {
      props.setParameter(parameter);
    }
    if (activeStep === 2) {
      props.saveBinding();
    }
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
    props.setStep(activeStep - 1);
    disable(false);
  }

  const handleReset = () => {
    setActiveStep(0);
    props.setStep(0);
    props.clearBinding();
    setResult('');
    setParameter('');
  }

  const handleResultChange = (e) => {
    if (e.target.value === '') {
      disable(true);
      setResult(e.target.value);
    } else {
      setResult(e.target.value);
      props.setResult(e.target.value);
      disable(false);
    }
  }

  const handleParameterChange = (e, val) => {
    e.persist()
    if (e.target.value === '') {
      disable(true);
      setParameter(e.target.value);
    } else {
      setParameter(e.target.value);
      disable(false);
    }
  }

  const showPreview = () => {
    disable(false)
    props.clearParam();
    setParameter('');
  }

  /*const showPreview = () => {
    let binding = props.createBinding();
    httpRequests.sendBinding(binding)
      .then(function (res) {
        httpRequests.runManipulationService(binding)
          .then(function (res2) {
            props.switchCodePreview();
            disable(false);
          })
          .catch(function (res2) {
            console.log(res2);
          })
      })
      .catch(function (res) {
        console.log(res);
      })
  }*/

  const addParameter = () => {
    props.clearParam();
    setActiveStep(1);
    props.setStep(1);
    setParameter('');
  }


  const saveErc = () => props.saveErc();

  const goToErc = () => props.goToErc();

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label} >
            <StepLabel><h3 id={"label"+index}>{label}</h3></StepLabel>
            <StepContent>
              {activeStep === 0 && props.figures !== '' ?
                <ComputationalResult value={result} figures={props.figures} handleResultChange={handleResultChange} />
                : ''}
              {/*activeStep === 1 ?
                <SelectedCode id="plotfunction" label="plot() function" handleChange={handlePlotChange} value={plot} />
              : ''*/}
              {activeStep === 1 ?
                <ParamResult value={parameter} params={props.possibleParameters} handleParamChange={handleParameterChange} />
                : ''}
              {activeStep === 2 ?
                <div>
                  <FormControl component="fieldset">
                    <RadioGroup id="widget" aria-label="position" name="position" value={widget} onChange={handleWidgetChange} row>
                      <WidgetSelector id="slider" value="slider" label="Slider" />
                      <WidgetSelector id="radio" value="radio" label="Radio" />
                    </RadioGroup>
                  </FormControl>
                  {widget === 'slider'
                    ? <div>
                      <SliderSetting id="min" label="Minimum value" type="number" handleSlider={(e) =>
                        handleSlider(e.target.value, 'minValue')} styles={classes.numField} />
                      <SliderSetting id="max" label="Maximum value" type="number" handleSlider={(e) =>
                        handleSlider(e.target.value, 'maxValue')} styles={classes.numField} />
                      <SliderSetting id="step" label="Step size" type="number" handleSlider={(e) =>
                        handleSlider(e.target.value, 'stepSize')} styles={classes.numField} />
                      <SliderSetting id="captionSlider" label="Description" type="text" handleSlider={(e) =>
                        handleSlider(e.target.value, 'caption')} styles={classes.textField} />
                    </div>
                    : <div>
                      <ChipInput id="chips" style={{ marginBottom: '3%' }}
                        onChange={(chips) => handleSlider(chips, 'options')}
                        placeholder="Type and enter at least two options"
                      />
                      <SliderSetting id="captionRadio" label="Description" type="text" handleSlider={(e) =>
                        handleSlider(e.target.value, 'caption')} styles={classes.textField} />
                    </div>
                  }
                  <Button variant="contained" color="primary" id="add"
                    //disabled={disabled2}
                    onClick={addParameter}
                  >
                    Add paramater
                      </Button>
                  <Button id={"save"} variant="contained" color="primary" style={{ marginLeft: '5%' }}
                    //disabled={disabled2}
                    onClick={showPreview}
                  >
                    Save parameter
                  </Button>
                  <Button variant="contained" color="primary" style={{ marginLeft: '5%' }}
                    onClick={handleReset}
                  >
                    Reset
                      </Button>
                </div>
                : ''}
              <div className={classes.actionsContainer} style={{ marginTop: '5%' }}>
                <Button className={classes.button}
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button id="next" variant="contained" color="primary" className={classes.button}
                  onClick={handleNext}
                  disabled={disabled}
                >
                  {activeStep === steps.length - 1 ? 'Save binding' : 'Next'}
                </Button>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} className={classes.resetContainer}>
          <Typography id="text">All steps completed - Feel free to create another binding</Typography>
          <Button onClick={handleReset} className={classes.button} variant="contained" color="primary">
            Create another binding
          </Button>
          <Button onClick={saveErc} disabled = {!valid2} className={classes.button} variant="contained" color="primary">
            Publish
          </Button>
          {props.candidate
            ? <Button onClick={goToErc} className={classes.button} variant="contained">
                Preview
              </Button>
            : <Button onClick={goToErc} disabled = {props.candidate} className={classes.button} variant="contained" color="primary">
                Go to ERC
              </Button>
          }
        </Paper>
      )}
    </div>
  );
}

class Bindings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metadata: props.metadata,
      erc: props.compendium_id,
      mainfile: props.metadata.mainfile,
      figures: '',
      analyzedCode: '',
      bindings: [],
      binding: '',
      bindingResult: {},
      bindingCode: '',
      //codeview:true,
      possibleParameters: [],
      tmpParam: [],
      parameter: [],
      //tmpPlotFunction: '',
      creationStep: 0,
      preview: false,
    }
    this.handleClose = this.handleClose.bind(this);
    //this.getFakeData = this.getFakeData.bind(this);
  }

  componentDidMount() {
    this.extractPlotFunctions(this.props.compendium_id, this.props.metadata.mainfile);
  }

  extractPlotFunctions(compendium_id, mainfile) {
    const self = this;
    httpRequests.getCode(compendium_id, mainfile)
      .then(function (res) {
        let codelines = res.data.data;
        let plotFunctions = [];
        for (let i in codelines) {
          let plotFunction = self.isPlotFunction(codelines[i])
          if (plotFunction) {
            plotFunction.plotFunction = codelines[i];
            plotFunction.line = i;
            if (codelines[i].search("Figure") === -1) {
              plotFunction.type = "table";
              plotFunction.result = "Table " + codelines[i].substring(10, codelines[i].indexOf("()"));
            }
            else {
              plotFunction.type = "figure";
              plotFunction.result = "Figure " + codelines[i].substring(10, codelines[i].indexOf("()"));
            }
            plotFunctions.push(plotFunction);
          }
        }
        let codestring = codelines.join('\n') + '\n';
        let analyzedCode;
        try {
          analyzedCode = RParse(codestring);
        }
        catch (err) {
          self.setState({open:true})
          console.log(err)
        }
        self.setState({
          figures: plotFunctions,
          analyzedCode: analyzedCode,
          codelines: codelines
        });
      });
  }

  isPlotFunction = (codeline) => {
    const regex = /plotFigure\d*[a-z]?\(/g;
    let begin = codeline.search(regex);
    let found;
    if (begin !== -1) {
      let end = codeline.indexOf(')', begin)
      found = {
        firstIndex: begin,
        lastIndex: end
      };
    } else {
      found = false
    }
    return found;
  }

  setResult(figure) {
    if (figure.indexOf("Figure") >= 0) {
      let state = this.state;
      let selectedFigure = this.state.figures.find(element => element.plotFunction === figure);
      state.bindingResult = selectedFigure;
      state.bindingCode = this.sliceCode(state.analyzedCode, selectedFigure);
      this.setState(state, () => {
        this.createBinding(true, true);
      });
    }
  }

  sliceCode = (analyzedCode, plotFunction) => {
    console.log(analyzedCode)
    let code = slice(analyzedCode,
      {
        items: [{
          first_line: parseInt(plotFunction.line) + 1,
          first_column: plotFunction.firstIndex,
          last_line: parseInt(plotFunction.line) + 1,
          last_column: parseInt(plotFunction.lastIndex) + 1
        }]
      });
    console.log(code)
    code = this.analyzeIfConditions(analyzedCode.code, code.items);
    code = this.sortCode(code); //There is already a sorting implementation in the bindings servce. Let's see which one we actually need.
    code = this.groupCode(code);
    this.extractPossibleParameters(analyzedCode.code, code)

    return code;
  }

  sortCode = (codelines) => {
    let sortedCodelines = codelines.sort(function (a, b) {
      return a.first_line - b.first_line;
    })
    return sortedCodelines;
  }

  createBinding = (preview, first) => {
    const self = this;
    let binding = {
      "id": self.state.erc,
      "computationalResult": self.state.bindingResult,
      "sourcecode": {
        "file": self.state.mainfile,
        "codelines": self.state.bindingCode,
        "parameter": self.state.parameter,
      },
      "preview": preview,

    };
    self.setState({ binding: binding }, () => {
      self.showPreview(binding, !first);
    });
    return binding;
  }

  showPreview = (binding, restartManipulation) => {
    console.log("show preview")
    const self = this;
    httpRequests.sendBinding(binding)
      .then(function (res) {
        if (restartManipulation) {
          httpRequests.runManipulationService(binding)
            .then(function (res2) {
              self.setState({ preview: true })
              //props.switchCodePreview();
              //disable(false);
            })
            .catch(function (res2) {
              console.log(res2);
            })
        }
        else {
          self.setState({ preview: true })
        }
      })
      .catch(function (res) {
        console.log(res);
      })
  }

  groupCode = (codelines) => {
    let groupedCode = codelines;
    for (let i = 0; i < groupedCode.length - 1; i++) {
      if (groupedCode[i].first_line <= groupedCode[i + 1].first_line && groupedCode[i].last_line >= groupedCode[i + 1].last_line) {
        groupedCode.splice(i + 1, 1)
        i--;
      }
      else if (groupedCode[i].last_line === groupedCode[i + 1].first_line || groupedCode[i].last_line + 1 === groupedCode[i + 1].first_line) {
        groupedCode.splice(i, 2, { first_line: groupedCode[i].first_line, last_line: groupedCode[i + 1].last_line });
        i--;
      }
    }
    return groupedCode;
  }

  analyzeIfConditions = (analyzedCode, codelines) => {

    for (var codeItem of analyzedCode) {
      if (codeItem.type === "if"  || codeItem.type === "while" ) {
        if(codeItem.code[0].func && codeItem.code[0].func.id ==="install.packages"){
          codelines.push(codeItem.location);
        }
        else{
        for (var line of codelines) {
          if (line.first_line > codeItem.location.first_line && line.last_line < codeItem.location.last_line) {
            codelines.push(codeItem.location);
            break;
            }
          }
        }
      }
      else if(codeItem.type === "call") {
        if(codeItem.func.id === "load"){
          codelines.push(codeItem.location)
        }
      }
      else if(codeItem.type === "import"){
        codelines.push(codeItem.location)
      }
  }
    return codelines;
  }

  extractPossibleParameters = (analyzedCode, codelines) => {
    let possibleParameters = this.state.possibleParameters;
    for (var codeItem of analyzedCode) {
      if (codeItem.type === "assign" && codeItem.sources[0].type === "literal") {
        for (var line of codelines) {
          if (line.first_line <= codeItem.location.first_line && line.last_line >= codeItem.location.last_line) {
            codeItem.text = this.state.codelines[codeItem.location.first_line - 1].substring(codeItem.location.first_column, codeItem.location.last_column)
            possibleParameters.push(codeItem);
          }
        }
      }
    }
    this.setState({ possibleParameters: possibleParameters }, () => console.log(this));
  }

  /*getFakeData () {
    let title = this.state.metadata.title;
    let figures = [];
    fakeBindings.forEach(element => {
      if ( element.title === title ) {
        figures.push(element)
      }
    });
    this.setState({
      figures:figures,
    });
  }*/

  /*handleMouseUp ( e ) {
    if (this.state.creationStep === 1) {
      try {
        this.setCode(window.getSelection().getRangeAt(0).toString());
      } catch (error) {
      }
    } else if (this.state.creationStep === 2) {
      this.setState({
        tmpParam: window.getSelection().getRangeAt(0).toString(),
      });
    }
  }*/

  setStep(step) {
    this.setState({
      creationStep: step
    });
  }

  setParameter(param) {
    let state = this.state;
    let parameter = {
      text: param.text,
      name: param.targets[0].id,
      val: param.sources[0].value,
    }
    state.tmpParam.push(parameter);
    this.setState(state);
  }

  /*setCode ( code ) {
    let self = this;
    let state = this.state;
    state.tmpPlotFunction = code;
    this.setState(state, () => {
      httpRequests.getCodelines({id: state.tmpCompId, plot:state.tmpPlotFunction, file:state.tmpFile})
      .then( function ( res ) {
        self.setState({
          tmpCodelines: res.data.data.codelines
        })
      })
      .catch( function (res) {
        console.log(res)
      })
    });
  }*/

  setWidget(key, val, type) {
    let state = this.state;
    let newVal = val;
    let params = state.tmpParam;
    if (!isNaN(newVal)) {
      newVal = Number(newVal)
    }
    if (params.length > 0) {
      if (params[params.length - 1].uiWidget === undefined) {
        params[params.length - 1].uiWidget = {};
      }
      params[params.length - 1].uiWidget[key] = newVal;
      params[params.length - 1].uiWidget.type = type;
    } else {
      if (params[0].uiWidget === undefined) {
        params[0].uiWidget = {};
      }
      params[0].uiWidget[key] = newVal;
      params[params.length - 1].uiWidget.type = type;
    }
    this.setState(state);
  }



  saveBinding() {
    let state = this.state;
    let binding = this.createBinding(false, true);
    state.bindings.push(binding);
    state.metadata.interaction.push(binding);
    this.setState(state);
  }

  //switchCodePreview = () => this.setState({codeview:!this.state.codeview,});

  clearParam = () => {
    let value = this.state.tmpParam;
    let arr = this.state.possibleParameters;
    var index = -1
    for (var i in arr) {
      if (value[0] && arr[i].targets[0].id === value[0].name) {
        index = i;
      }
    }
    if (index > -1) {
      arr.splice(index, 1);
    }
    this.setState({ tmpParam: [], parameter: this.state.parameter.concat(this.state.tmpParam), possibleParameters: arr }, () => this.createBinding(true, false))
  };

  saveErc = () =>  {
    this.props.setChangedFalse("all")
    this.props.updateMetadata(this.props.metadata, true)

  }

  goToErc= () => {
    this.props.goToErc();
  }

  clearBinding() {
    let state = this.state;
    //state.codeview=true;
    state.bindingResult = {};
    state.tmpParams = [];
    state.tmpParam = [];
    state.preview = false;
    state.binding = [];
    state.parameter = [];
    state.possibleParameters = [];

    //state.tmpPlotFunction='';
    state.tmpBinding = '';
    this.setState(state);
  }

  handleClose(){
    this.setState({open: false});
  }

  render() {
    return (
      <div className="bindingsView" style={{ marginTop: "5%" }}>
        <h3>The feature for creating interactive figures automatic is still in its infancy.
        If the creation does not work please contact us since we are strongly interested in creating them for you:
              <a href="mailto:o2r.team@uni-muenster.de"> o2r.team [ at ] uni-muenster [.de]</a>
        </h3>
        <Grid container>
          <Grid item xs={4}>
            <div className="steps">
              <VerticalLinearStepper
                setResult={this.setResult.bind(this)}
                setStep={this.setStep.bind(this)}
                setWidget={this.setWidget.bind(this)}
                //switchCodePreview={this.switchCodePreview.bind(this)}
                setParameter={this.setParameter.bind(this)}
                tmpParam={this.state.tmpParam}
                possibleParameters={this.state.possibleParameters}
                parameter={this.state.parameter}
                extractPossibleParameters={this.extractPossibleParameters.bind(this)}
                //tmpPlotFunction={this.state.tmpPlotFunction}
                createBinding={this.createBinding.bind(this)}
                clearParam={this.clearParam.bind(this)}
                saveBinding={this.saveBinding.bind(this)}
                saveErc={this.saveErc.bind(this)}
                goToErc={this.goToErc.bind(this)}
                candidate={this.props.candidate}
                clearBinding={this.clearBinding.bind(this)}
                figures={this.state.figures}
              />
            </div>
          </Grid>
          <Grid item xs={8}>
            {this.state.preview ?
              /*<div>
                <div className='codeView'
                  onMouseUp={this.handleMouseUp.bind(this)}
                >
                  <Sourcecode code={this.props.codefile.data} />
                </div>
              </div>
              :*/
              <div>
                <h4 id="preview">Preview of the interactive figure</h4>
                <div className='codeView'>
                  <Manipulate bindings={[this.state.binding]} />
                  {/*<Button variant="contained" color="primary"
                onClick={this.switchCodePreview.bind(this)}
                >
                Back to code
                </Button>
              */}
                </div>
              </div> : ''
            }
          </Grid>
        </Grid>
        <Dialog
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Automatic Binding Creation Failed"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          The feature for creating interactive figures automatic is still in its infancy. For your Figure the creation did not worked.
          Please, contact us since we are strongly interested in creating them for you: <a href="mailto:o2r.team@uni-muenster.de" target="_blank" rel="noopener noreferrer"> o2r.team [ at ] uni-muenster [.de]</a>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Go Back
          </Button>
          <Button onClick={() => {window.location.href="mailto:o2r.team@uni-muenster.de?subject=CreateBinding"}} color="primary" autoFocus>
            Contact
          </Button>
        </DialogActions>
      </Dialog>
      </div>
    );
  }
}

export default Bindings;


/*
    getBindingJson(erc) {
        return {
            "id": erc.id,
            "computationalResult": {
                "type": "figure",
                "result": "Figure 3"
            },
            "port": 5001,
            "sourcecode": {
                "file": erc.metadata.o2r.mainfile,
                "codelines": [{"start":30,"end":424}],
                "parameter":
                    [{
                       "text":"velocity <- 0.5",
                       "name":"velocity",
                       "val":0.5,
                       "codeline":344,
                       "uiWidget":{
                          "type":"slider",
                          "minValue":0.1,
                          "maxValue":3.5,
                          "stepSize":0.1,
                          "caption":"Changing the velocity parameter affects damage costs"
                       }
                    },
                    {
                        "text":"duration <- 24",
                        "name":"duration",
                        "val":24,
                        "codeline":346,
                        "uiWidget":{
                           "type":"slider",
                           "minValue":1,
                           "maxValue":24,
                           "stepSize":1,
                           "caption":"Changing the duration parameter affects damage costs"
                        }
                     },
                     {
                        "text":"sediment <- 0.05",
                        "name":"sediment",
                        "val":0.05,
                        "codeline":345,
                        "uiWidget":{
                           "type":"slider",
                           "minValue":0.01,
                           "maxValue":1.0,
                           "stepSize":0.1,
                           "caption":"Changing the sediment parameter affects damage costs"
                        }
                     }
                    ],
                 "data":[
                    {
                       "file":"costs.csv",
                       "column":[
                          {
                             "name":"Costs",
                             "rows":"1-37"
                          }
                       ]
                    }
                 ]
            }
        }
    }
*/
