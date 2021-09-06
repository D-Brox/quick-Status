const { Plugin } = require('powercord/entities')
const { inject, uninject } = require('powercord/injector')
const { React, getModule, contextMenu } = require('powercord/webpack')
const AliasHandler = new (require('./AliasHandler.jsx'))()
const AddStatus = require('./AddStatus')
const { ContextMenu } = require('powercord/components');
const { open } = require("powercord/modal");

const settings = getModule([ 'updateRemoteSettings' ],false);

module.exports = class StatusToggle extends Plugin {
    async startPlugin () {
        powercord.api.commands.registerCommand({
            command: 'Status',
            alias:'status',
            description: 'Quick Status Toggle',
            usage: '{c} [ args ]',
            executor: (args) => {      
                let status = AliasHandler.getAlias(args[0])
                console.log(status)
                if(status === null){
                    return {
                        send: false,
                        result: "Please insert a valid alias"
                    }
                }
                else{
                    settings.updateRemoteSettings({
                        customStatus: { text : status }
                    });
                    return {
                        send: false,
                        result: "Status Updated"
                    }
                }
            },
            autocomplete: (args) => {
                if (args[0] !== void 0 && args.length === 1) {
                    let aliases =  AliasHandler.getAliases()
                    return {
    				    commands: Object.keys(aliases)
    					    .filter((alias) => alias.toLowerCase().includes(args[0].toLowerCase()))
    					    .map((alias) => ({
    						    command: alias,
    						    description: aliases[alias],
    					    })),
				    header: 'Quick Status'
                    }
			    }
            }
        })
        powercord.api.commands.registerCommand({
            command: 'Status.manage',
            alias:'status.manage',
            description: 'Manage your aliases',
            usage: '{c} [ args ]',
            executor: (args) => {             
                switch(args[0]){               
                    case 'add':
                        if(!args[1]) return {
                            send: false,
                            result: 'Please input an alias'
                        }
                        let status = args.slice(2).join(' ')
                        if(!status) return {
                            send: false,
                            result: 'Please input an Status for the alias'
                        }
                        AliasHandler.setAlias(args[1],status)
                        return {
                            send: false,
                            result: 'Alias **'+args[1]+' <- '+status+'** added'
                        }
                        break
                    case 'del':
                        let alias = AliasHandler.getAlias(args[1])
                        if(!alias)return {
                            send: false,
                            result: '**'+ args[1] + '** is not an alias.'
                        }
                        AliasHandler.deleteAlias(args[1])
                        return {
                            send: false,
                            result: 'Alias **'+args[1]+'** deleted'
                        }
                        break
                    case 'list':
                        let aliases = AliasHandler.getAliases()
                        let out = ''
	                    for(let i = 0; i < Object.keys(aliases).length; i++) {	        
                            let alias = Object.keys(aliases)[i]
                            out+= '**'+alias+'**: '+aliases[alias]+'\n'
                        }
                        let result = {
                            type: 'rich',
                            title: 'List of aliases:',
                            description: out
                        };     
                        return {
                            send: false,
                            result
                        }
                        break
                }
            },
            autocomplete: (args) => {
			    if (args.length !== 1) {
				    return false;
			    }
                let options = {
                    list: 'Lists all Status aliases saved',
                    add: 'Adds a Status alias.',
                    del: 'Deletes a Status alias.'
                }
			    return {
				    commands: Object.keys(options)
					    .filter((option) => option.includes(args[0].toLowerCase()))
					    .map((option) => ({
						    command: option,
						    description: options[option],
					    })),
				    header: 'Quick Status',
			    };
		    }
        }) 

        const CustomStatus = await getModule(m => m.default?.displayName === "CustomStatus");

        inject("quick-status-context", CustomStatus, "default", (args, res) => {
            res.props.onContextMenu = (args) => {
                let aliases = AliasHandler.getAliases();

                let buttons =  []

                for (const key in aliases) {
                    const status = aliases[key];

                    buttons.push({
                        type: 'button',
                        name: status,
                        onClick: () => {
                            const prev = document.getElementsByClassName('customStatus-3tC2ig')[0].children[0].textContent

                            settings.updateRemoteSettings({
                                customStatus: { text : status }
                            });
                            powercord.api.notices.sendToast('status-changed', {
                                header: "Changed Status",
                                timeout: 5000,
                                content: "New Status: " + status,
                                buttons: [ 
                                    {
                                        text: 'Dismiss',
                                        look: 'ghost',
                                        size: 'small',
                                        onClick: () => powercord.api.notices.closeToast('status-changed')
                                    },
                                    {
                                        text: 'Undo',
                                        look: 'ghost',
                                        size: 'small',
                                        onClick: () => {
                                            settings.updateRemoteSettings({
                                                customStatus: { text : prev }
                                            });
                                            powercord.api.notices.closeToast('status-changed');
                                        }
                                    }
                                ]
                            })
                        }
                    })
                }

                buttons.push({
                    type: 'button',
                    name: 'Add Status +',
                    onClick: () => open(AddStatus)
                })

                let menu = React.createElement(ContextMenu, {
                    itemGroups: [ buttons ]
                });

                contextMenu.openContextMenu(args, () => menu);
            }

            return res;
        });

        CustomStatus.default.displayName = "CustomStatus";
    }
    
    pluginWillUnload () {
        powercord.api.commands.unregisterCommand('Status')
        powercord.api.commands.unregisterCommand('Status.manage')
        uninject("quick-status-context");
    }
}
