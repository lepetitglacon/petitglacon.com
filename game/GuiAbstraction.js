import {GUI} from "dat.gui";

export default class GuiAbstraction {
    constructor({engine}) {
        this.engine = engine

        this.guis = new Map()
        this.guis.set('root', new GUI)
    }

    addGui(name, to = null) {
        let gui = null
        if (to && this.guis.has(to)) {
            gui = this.guis.get(to)
        } else {
            gui = this.guis.get('root')
        }
        const newGui = gui.addFolder(name)
        newGui.open()
        this.guis.set(name, newGui)
        return newGui
    }
}