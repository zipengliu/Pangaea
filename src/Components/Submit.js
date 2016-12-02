/*
 * Created by Stewart Grant
 */

import React, { Component } from 'react';
import 'whatwg-fetch';
import StateDetail from './StateDetail';
import TimeCurve from './TimeCurve';
import Dropzone from 'react-dropzone';
import WebSocket from 'simple-websocket';

class Submit extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedState: null,
            points: [],
            states: [],
            DropzoneDemo: React.createClass({
                
                //ws: WebSocket("ws://localhost:23333/"),
                ws: WebSocket("ws://198.162.52.147:23333/"),

                onDrop: function (files) {
                  var ready = false;
                  var result = '';

                  var check = function(ws) {
                    let that = this
                    if (ready === true) {
                      console.log("done")
                      ws.call('submit',result, function (err, resp) {
                        if (resp.status >= 400) {
                            throw new Error("Bad response from server");
                        } else {

                            resp.points = resp.points.map(p => [that.transformPoints(p[0]), that.transformPoints(p[1])]);
                            //start here
                            that.setState({
                                points: resp.points,
                                states: resp.states
                            })
                        }


                        //display
                      });

                         // do what you want with the result variable
                         return;
                    }
                    setTimeout(function () { check(ws)} , 1000);
                  }
                  console.log('Received files: ', files);
                  // extend ws to decode messages
                  require('express-ws-rpc')(this.ws);
                  var file = files[0];
                  var fr = new FileReader();
                  fr.onload = function(e) { 
                      result = e.target.result
                      ready = true
                  }
                  fr.readAsText(file)
                  check(this.ws);

                },

                render: function () {
                  return (
                      <div>
                        <Dropzone onDrop={this.onDrop}>
                          <div>Try dropping some files here, or click to select files to upload.</div>
                        </Dropzone>
                      </div>
                  );
                },

            }),
        }
        //bootstrapping functions
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {

    }

    componentDidUpdate() {
        console.log('component did update');
    }


    rpcCall(contents){
    }

    handleSubmit(e) {
        e.preventDefault();
        let that = this;
        // Get state from server
        let transformPoints = x => (x + 2.0)*100;
        fetch(`http://localhost:23333/dinv-output/${this.props.params.instanceId}`)
            .then(function(response) {
                if (response.status >= 400) {
                    throw new Error("Bad response from server");
                }
                return response.json();
            }).then(function (data) {
                console.log(data);
                data.points = data.points.map(p => [transformPoints(p[0]), transformPoints(p[1])]);
                that.setState({
                    points: data.points,
                    states: data.states
                })
            });
    }


    



    render() {
        return (
            <div>
                <h1>Submit Dinv json output in the box below</h1>

                <div>
                    <TimeCurve points={this.state.points} />
                </div>
                <form enctype="multipart/form-data" onSubmit={this.handleSubmit}>
                    <input type="file" accept="image/*" name="myPic" />
                    <button>{'Submit'}</button>
                </form>
                <div>
                    <this.state.DropzoneDemo/>
                </div>
                <div>
                    <StateDetail state={this.state.selectedState} />
                </div>

            </div>
        )
    }
}


export default Submit;
