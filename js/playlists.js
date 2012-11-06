var Playlists = function () {

var lists

/**
 * A singleton interface for manipulating playlists
 *
 * @class Playlists
*/

var Playlists = {
/**
 * Updates the playlists from the 'database'.
 *
 * @method Playlists
 * @static
*/
	load: function () {
		try {
			lists = JSON.parse(localStorage.getItem('playlists'))
		} catch (e) {
			/* in case it's the first time we're accessing the data */
			lists = []
		}

		if (!lists) lists = []
	},
/**
 * Saves the changes made to the lists to the 'database'.
 *
 * @method Playlists
 * @static
*/
	save: function () {
		localStorage.setItem('playlists', JSON.stringify(lists))
	},

/**
 * Creates a new playlist.
 *
 * @method Playlists
 * @static
 *
 * @arg {String} name The name of the new playlist.
 *
 * @return {Object} The playlist created.
*/
	create: function (name) {
		if (Playlists.getByName(name)) {
			throw Error('Playlist already exists!')
		}

		lists.push({
			name: name,
			shortname: Playlists.createShortName(name),
			description: '',
			list: []
		})

		return lists[lists.length - 1]
	},

/**
 * Removes a playlist from the list of playlists.
 *
 * @method Playlists
 * @static
 *
 * @arg {Object} playlist The playlist to remove.
*/
	remove: function (playlist) {
		lists.splice(lists.indexOf(playlist), 1)
	},

/**
 * Gets a playlist by its name.
 *
 * @method Playlists
 * @static
 *
 * @arg {String} name The name of the playlist.
 *
 * @return {Object} The playlist requested.
*/
	getByName: function (name) {
		for (var i=0; i<lists.length; i++) {
			if (lists[i].name === name) return lists[i]
		}

		return null
	},

/**
 * Gets a playlist by its short name.
 *
 * @method Playlists
 * @static
 *
 * @arg {String} sname The short name of the playlist.
 *
 * @return {Object} The playlist requested.
*/
	getByShortName: function (sname) {
		for (var i=0; i<lists.length; i++) {
			if (lists[i].shortname === sname) return lists[i]
		}

		return null
	},

/**
 * Creates a short name for a playlist based on its name.
 *
 * @method Playlists
 * @static
 *
 * @arg {String} name The name of the playlist.
 *
 * @return {String} The generated short name.
*/
	createShortName: function (name) {
		var sname = name.toLowerCase().replace(/[^a-z]+/g, '-')

		while (Playlists.getByShortName(sname)) {
			/* FIXME: This is not a good way to do it */
			sname += '1'
		}

		return sname
	},

/**
 * Gets all playlists the user has.
 *
 * @method Playlists
 * @static
 *
 * @return {Array} The list of playlists.
*/
	getAll: function () {
		return lists.slice()
	}
}

Playlists.load()

return Playlists

}()
