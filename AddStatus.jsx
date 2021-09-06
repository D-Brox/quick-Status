const { React, getModule } = require("powercord/webpack");
const { Modal } = require("powercord/components/modal");
const { close: closeModal } = require("powercord/modal");
const { FormTitle, Button } = require("powercord/components");
const { TextInput } = require('powercord/components/settings');

const { marginLeft8 } = getModule(["marginLeft8"], false);

const AliasHandler = new (require('./AliasHandler.jsx'))()
const settings = getModule([ 'updateRemoteSettings' ], false);

module.exports = class AddStatus extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            alias: "",
            text: ""
        }
    }

    render() {
        return (
            <Modal className="powercord-text">
                <Modal.Header>
                    <FormTitle tag="h4">Add Status</FormTitle>
                </Modal.Header>

                <Modal.Content>
                    <TextInput
                        title="Alias"
                        value={this.state.alias}
                        onChange={(a) => {
                            this.setState({alias: a})
                        }}
                    >Enter Alias to your Status</TextInput>
                    <TextInput
                        title="Text Status"
                        value={this.state.text}
                        onChange={(a) => {
                            this.setState({text: a})
                        }}
                    >Enter Text Status</TextInput>
                </Modal.Content>

                <Modal.Footer>
                    <Button
                        color={Button.Colors.GREEN}
                        className={marginLeft8}
                        disabled={this.state.alias == "" && this.state.text == ""}
                        onClick={() => {                        
                                AliasHandler.setAlias(this.state.alias, this.state.text);

                                settings.updateRemoteSettings({
                                    customStatus: {text: this.state.text}
                                });

                                closeModal();
                            }
                        }   
                    >Save & Switch</Button>
                    <Button
                        color={Button.Colors.BLUE}
                        disabled={this.state.alias == "" && this.state.text == ""}
                        onClick={() => {                        
                                AliasHandler.setAlias(this.state.alias, this.state.text);

                                closeModal();
                            }
                        }   
                    >Save</Button>
                    <Button
                      color={Button.Colors.TRANSPARENT}
                      look={Button.Looks.LINK}
                      onClick={closeModal}
                    >
                      Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}