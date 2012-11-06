var Playlists = function () {

var lists

try {
	lists = JSON.parse(localstorage.getItem('playlists'))
} catch (e) {
	/* in case it's the first time we're accessing the data */
	lists = []
}

var Playlists = {
	save: function () {
		localstorage.setItem('playlists', JSON.stringify(lists))
	},

	create: function (name) {
		if (Playlists.getByName(name)) {
			throw Error('Playlist already exists!')
		}

		lists.push({
			name: name,
			shortname: name.toLowerCase.replace(/[^a-z]+/g, '-')
			description: '',
			list: []
		})

		return lists[lists.length - 1]
	},

	getByName: function (name) {
		for (var i=0; i<lists.length; i++) {
			if (lists[i].name === name) return lists[i]
		}

		return null
	},

	getByShortName: function (sname) {
		for (var i=0; i<lists.length; i++) {
			if (lists[i].shorname === sname) return lists[i]
		}

		return null
	},

	getAll: function () {
		return lists.slice()
	}
}

return Playlists

}()
