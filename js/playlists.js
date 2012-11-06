var Playlists = function () {

var lists

var Playlists = {
	load: function () {
		try {
			lists = JSON.parse(localStorage.getItem('playlists'))
		} catch (e) {
			/* in case it's the first time we're accessing the data */
			lists = []
		}

		if (!lists) lists = []
	},

	save: function () {
		localStorage.setItem('playlists', JSON.stringify(lists))
	},

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

	remove: function (playlist) {
		lists.splice(lists.indexOf(playlist), 1)
	},

	getByName: function (name) {
		for (var i=0; i<lists.length; i++) {
			if (lists[i].name === name) return lists[i]
		}

		return null
	},

	getByShortName: function (sname) {
		for (var i=0; i<lists.length; i++) {
			if (lists[i].shortname === sname) return lists[i]
		}

		return null
	},

	createShortName: function (name) {
		var sname = name.toLowerCase().replace(/[^a-z]+/g, '-')

		while (Playlists.getByShortName(sname)) {
			/* FIXME: This is not a good way to do it */
			sname += '1'
		}

		return sname
	},

	getAll: function () {
		return lists.slice()
	}
}

Playlists.load()

return Playlists

}()
