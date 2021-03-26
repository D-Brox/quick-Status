const { Plugin } = require('powercord/entities')
const { inject, uninject } = require('powercord/injector')
const { React, getModule, getModuleByDisplayName} = require('powercord/webpack')
const AliasHandler = new (require('./AliasHandler.jsx'))()

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
                        if(alias===null)return {
                            send: false,
                            result: '```\nNot an alias.\n```'
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
					    .filter((option) => option.toLowerCase().includes(args[0].toLowerCase()))
					    .map((option) => ({
						    command: option,
						    description: options[option],
					    })),
				    header: 'Quick Status',
			    };
		    }
        }) 
    }
    
    pluginWillUnload () {
        powercord.api.commands.unregisterCommand('Status')
        powercord.api.commands.unregisterCommand('Status.manage')
    }
}
