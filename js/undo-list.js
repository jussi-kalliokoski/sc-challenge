function UndoList () {
	this.list = []
}

UndoList.prototype = {
	list: null,
	listIndex: -1,

	dodo: function (action, cancel) {
		this.list.splice(++this.listIndex)

		this.list.push([action, cancel])

		action()
	},

	undo: function () {
		if (this.listIndex === -1) return false

		this.list[this.listIndex--][1]()

		return true
	},

	redo: function () {
		if (this.listIndex + 1 === this.list.length) return false

		this.list[++this.listIndex][0]()

		return true
	}
}
