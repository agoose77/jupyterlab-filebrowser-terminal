import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application'
import { ITerminal } from '@jupyterlab/terminal'
import { Terminal } from '@jupyterlab/services'
import { IFileBrowserFactory, FileBrowser } from '@jupyterlab/filebrowser'
import { MainAreaWidget } from '@jupyterlab/apputils'

function changeTerminalDir (session: Terminal.ITerminalConnection, path: string) {
  // Send
  session.send({
    type: 'stdin',
    content: [`cd ${path}\n`]
  })
}

/**
 * Initialization data for the jupyterlab-filebrowser-terminal extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-filebrowser-terminal:plugin',
  autoStart: true,
  requires: [IFileBrowserFactory],
  activate: (app: JupyterFrontEnd, fileBrowserFactory: IFileBrowserFactory) => {

    // Get filebrowser tracker
    const { tracker } = fileBrowserFactory

    // Get current filebrowser path
    function getCurrentPath () : string {
      const widget = tracker.currentWidget as FileBrowser
      return widget.model.path
    }

    // Add command to open in terminal
    const command: string = 'filebrowser:open-in-terminal'
    app.commands.addCommand(command, {
      label: 'Open in Terminal',
      execute: () => {
        app.commands
          .execute('terminal:create-new')
          .then((widget: MainAreaWidget<ITerminal.ITerminal>) => {
            const terminal = widget.content
            const path = getCurrentPath()

            changeTerminalDir(terminal.session, path)
          })
      },
      isEnabled: () => app.serviceManager.terminals.isAvailable()
    })

    app.contextMenu.addItem({
      command: command,
      selector: '.jp-DirListing-content'
    })
  }
}

export default plugin
