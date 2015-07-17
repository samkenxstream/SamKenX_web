/*
Copyright 2015 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var React = require('react');

var ComponentBroker = require("../../../../src/ComponentBroker");

var Loader = require("react-loader");

var RegisterController = require("../../../../src/controllers/templates/Register");

var ServerConfig = ComponentBroker.get("molecules/ServerConfig");

module.exports = React.createClass({
    DEFAULT_HS_URL: 'https://matrix.org',
    DEFAULT_IS_URL: 'https://matrix.org',

    displayName: 'Register',
    mixins: [RegisterController],

    getInitialState: function() {
        return {
            serverConfigVisible: false
        };
    },

    componentWillMount: function() {
        this.customHsUrl = this.DEFAULT_HS_URL;
        this.customIsUrl = this.DEFAULT_IS_URL;
    },

    getRegFormVals: function() {
        return {
            email: this.refs.email.getDOMNode().value,
            username: this.refs.username.getDOMNode().value,
            password: this.refs.password.getDOMNode().value,
            confirmPassword: this.refs.confirmPassword.getDOMNode().value
        };
    },

    getHsUrl: function() {
        if (this.state.serverConfigVisible) {
            return this.customHsUrl;
        } else {
            return this.DEFAULT_HS_URL;
        }
    },

    getIsUrl: function() {
        if (this.state.serverConfigVisible) {
            return this.customIsUrl;
        } else {
            return this.DEFAULT_IS_URL;
        }
    },

    onServerConfigVisibleChange: function(ev) {
        this.setState({
            serverConfigVisible: ev.target.checked
        });
    },

    getUserIdSuffix: function() {
        var actualHsUrl = document.createElement('a');
        actualHsUrl.href = this.getHsUrl();
        var defaultHsUrl = document.createElement('a');
        defaultHsUrl.href = this.DEFAULT_HS_URL;
        if (actualHsUrl.host == defaultHsUrl.host) {
            return ':matrix.org';
        }
        return '';
    },

    onServerUrlChanged: function(newUrl) {
        this.customHsUrl = this.refs.serverConfig.getHsUrl();
        this.customIsUrl = this.refs.serverConfig.getIsUrl();
        this.forceUpdate();
    },

    componentForStep: function(step) {
        switch (step) {
            case 'initial':
                var serverConfigStyle = {};
                if (!this.state.serverConfigVisible) {
                    serverConfigStyle.display = 'none';
                }
                return (
                    <div>
                        <form onSubmit={this.onInitialStageSubmit}>
                        Email: <input type="text" ref="email" defaultValue={this.savedParams.email} /><br />
                        Username: <input type="text" ref="username" defaultValue={this.savedParams.username} />{this.getUserIdSuffix()}<br />
                        Password: <input type="password" ref="password" defaultValue={this.savedParams.password} /><br />
                        Confirm Password: <input type="password" ref="confirmPassword" defaultValue={this.savedParams.confirmPassword} /><br />

                        <input type="checkbox" value={this.state.serverConfigVisible} onChange={this.onServerConfigVisibleChange} />
                        Use custom server options (advanced)
                        <div style={serverConfigStyle}>
                        <ServerConfig ref="serverConfig"
                            defaultHsUrl={this.customHsUrl} defaultIsUrl={this.customIsUrl}
                            onHsUrlChanged={this.onServerUrlChanged} onIsUrlChanged={this.onServerUrlChanged} />
                        </div>
                        <br />
                        <input type="submit" value="Continue" />
                        </form>
                    </div>
                );
            // XXX: clearly these should be separate organisms
            case 'stage_m.login.email.identity':
                return (
                    <div>
                        Please check your email to continue registration.
                    </div>
                );
            case 'stage_m.login.recaptcha':
                return (
                    <div ref="recaptchaContainer">
                        This Home Server would like to make sure you're not a robot
                        <div id="mx_recaptcha"></div>
                    </div>
                );
        }
    },

    registerContent: function() {
        if (this.state.busy) {
            return (
                <Loader />
            );
        } else {
            return (
                <div>
                    <h1>Create an account</h1>
                    {this.componentForStep(this.state.step)}
                    <div className="error">{this.state.errorText}</div>
                    <a onClick={this.showLogin} href="#">I already have an account</a>
                </div>
            );
        }
    },

    onBadFields: function(bad) {
        var keys = Object.keys(bad);
        var strings = [];
        for (var i = 0; i < keys.length; ++i) {
            switch (bad[keys[i]]) {
                case this.FieldErrors.PasswordMismatch:
                    strings.push("Passwords don't match");
                    break;
                case this.FieldErrors.Missing:
                    strings.push("Missing "+keys[i]);
                    break;
                case this.FieldErrors.TooShort:
                    strings.push(keys[i]+" is too short");
                    break;
                case this.FieldErrors.InUse:
                    strings.push(keys[i]+" is already taken");
                    break;
            }
        }
        var errtxt = strings.join(', ');
        this.setState({
            errorText: errtxt
        });
    },

    render: function() {
        return (
            <div className="mx_Register">
            {this.registerContent()}
            </div>
        );
    }
});
