/**
 * A simple utility class for managing an action history.
 *
 * @class
*/
function UndoList () {
	this.list = []
}

UndoList.prototype = {
	list: null,
	listIndex: -1,

/**
 * Saves an action to the action list and executes that action.
 *
 * @method UndoList
 *
 * @arg {Function} action The action to save.
 * @arg {Function} cancel An action that reverts the action.
*/
	dodo: function (action, cancel) {
		this.list.splice(++this.listIndex)

		this.list.push([action, cancel])

		action()
	},

/**
 * Undoes the previous action in the list.
 *
 * @method UndoList
 *
 * @return {Boolean} Indicates whether there was an action to undo.
*/
	undo: function () {
		if (this.listIndex === -1) return false

		this.list[this.listIndex--][1]()

		return true
	},

/**
 * Redoes the next action in the list.
 *
 * @method UndoList
 *
 * @return {Boolean} Indicates whether there was an action to redo.
*/
	redo: function () {
		if (this.listIndex + 1 === this.list.length) return false

		this.list[++this.listIndex][0]()

		return true
	}
}
