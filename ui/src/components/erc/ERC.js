import React from 'react';
import 'react-reflex/styles.css';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { InputLabel, FormControl, Select, FilledInput, Button } from "@material-ui/core";
import uuid from 'uuid/v1';

import config from '../../helpers/config'
import './erc.css';
import httpRequests from '../../helpers/httpRequests';
import MainView from './MainView/MainView';
import CodeView from './CodeView/CodeView';
import DataView from './DataView/DataView';

class ERC extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            id: this.props.match.params.id,
            displayfile: null,
            dataset: null,
            datafiles: null,
            codefile: null,
            codefiles: null,
        };  
    }

    componentDidMount() {
        this.getMetadata();
    }

    setDataFile(datafile) {
        const self = this;
        httpRequests.getFile(config.baseUrl + "compendium/" + self.state.id + "/data/" + datafile)
            .then(function(res) {
                httpRequests.getFile(config.baseUrl + "compendium/" + self.state.id + "/data/")
                    .then(function(res2) {
                        self.setState({
                            dataset: {
                                datafile: datafile,
                                data: res.data,
                                tree: res2.data.children,
                            },
                        });
                    })
                    .catch(function(res2) {
                        console.log(res2)
                    })   
            })
            .catch(function(res) {
                console.log(res)
            })
    }

    setCodeFile(codefile) {
        const self = this;
        httpRequests.getFile(config.baseUrl + "compendium/" + self.state.id + "/data/" + codefile)
        .then(function(res) {
            self.setState({
                codefile:{
                    filename:codefile,
                    file:res,
                },
            });
        })
        .catch(function(res) {
            console.log(res)
        })
    }

    setDisplayFile(displayfile) {
        this.setState({
            displayfile: displayfile,
        });        
    }

    handleDataChange(evt) {
        this.setDataFile(evt.target.value)
    } 

    handleCodeChange(evt) {
        this.setCodeFile(evt.target.value)
    }
    
    newJob() {
        const self=this;
        httpRequests.newJob({'compendium_id':self.state.id})
            .then(function(res) {
                console.log(res)
            })
            .catch(function(res) {
                console.log(res)
            })
    }

    getMetadata() {
        const self = this;
        httpRequests.singleCompendium(this.state.id)
            .then(function(response) {
                const data = response.data.metadata.o2r;
                console.log(response)
                self.setState({
                    datafiles: data.inputfiles,
                    dataset: data.inputfiles[0],
                    codefiles: data.codefiles,
                });
                self.setDisplayFile(data.displayfile);
                self.setDataFile(data.inputfiles[0]);
                self.setCodeFile(data.mainfile);
            })
            .catch(function (response) {
                console.log(response)
            })
    }
  
    render () {

        return (
            <div className="Erc">
                <ReflexContainer style={{ height: "87vh" }} orientation="vertical">
                    <ReflexElement>
                        {this.state.displayfile!=null ? <MainView 
                                                        filePath={config.baseUrl + "compendium/"+this.state.id + "/data/" + this.state.displayfile}>
                                                    </MainView> : <div>There is no file to display</div>}
                    </ReflexElement>
                    <ReflexSplitter propagate={true} style={{ width: "10px" }} />
                    <ReflexElement className="right-pane">
                        <ReflexContainer orientation="horizontal">
                            <ReflexElement className="right-up">
                                <Button color="inherit" onClick={this.newJob.bind(this)}>Run analysis</Button>
                                {this.state.codefiles != null && this.state.codefile != null ? 
                                    <FormControl variant="outlined">
                                        <InputLabel htmlFor="outlined-age-native-simple"></InputLabel>
                                        <Select
                                            native
                                            value={this.state.codefile.filename}
                                            onChange={this.handleCodeChange.bind(this)}
                                            input={<FilledInput name="dataset" id="filled-age-native-simple" />}
                                        >
                                            {this.state.codefiles.map(option => (
                                                <option value={option} key={uuid()}>{option}</option>
                                            ))}
                                        </Select>
                                    </FormControl> : ''}
                                {this.state.codefile != null ? <CodeView code={this.state.codefile}></CodeView> : <div>There is no data to display</div>}
                            </ReflexElement>
                            <ReflexSplitter propagate={true} style={{ height: "10px" }} />
                            <ReflexElement className="right-bottom">
                                {this.state.datafiles != null ? 
                                    <FormControl variant="outlined">
                                        <InputLabel htmlFor="outlined-age-native-simple"></InputLabel>
                                        <Select
                                            native
                                            value={this.state.dataset.datafile}
                                            onChange={this.handleDataChange.bind(this)}
                                            input={<FilledInput name="dataset" id="filled-age-native-simple" />}
                                        >
                                            {this.state.datafiles.map(option => (
                                                <option value={option} key={uuid()}>{option}</option>
                                            ))}
                                        </Select>
                                    </FormControl> : ''}
                                {this.state.dataset != null ? <DataView data={this.state.dataset}></DataView> : <div>There is no data to display</div>}
                            </ReflexElement>
                        </ReflexContainer>
                    </ReflexElement>
                </ReflexContainer>
            </div>
        )
    }
}

export default ERC;