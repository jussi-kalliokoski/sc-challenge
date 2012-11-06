void function (exports) {
var actions = new UndoList()
var nowPlaying = null

/**
 * Determines whether an element is inside another element.
 *
 * @arg {DOMElement} elem The child element.
 * @arg {DOMElement} parent The parent element.
 *
 * @return {Boolean} Determines whether elem is a child of parent.
*/
function isChildOf (elem, parent) {
	while (elem.parentNode) {
		if (elem.parentNode === parent) return true

		elem = elem.parentNode
	}

	return false
}

/**
 * Gets a template by name, compiles it on demand and executes it on the context.
 *
 * @arg {String} name The name of the template.
 * @arg {Object} context The execution context for the template.
 *
 * @return {String} The generated HTML.
*/
function template (name, context) {
	if (!template[name]) {
		template[name] = Handlebars.compile(
			document.getElementById(name + '-template').innerHTML
		)
	}

	return template[name](context)
}

var results = document.getElementById('results')
var playlist = document.getElementById('playlist')
var searchbox = document.getElementById('searchbox')
var playlistName = document.getElementById('playlist-name')
var playlistDescription = document.getElementById('playlist-description')


/**
 * A singleton interface to manipulate tracks found by search.
 *
 * @class FoundTrack
*/
var FoundTrack = {
/**
 * Adds a track to the playlist.
 *
 * @method FoundTrack
 * @static
 *
 * @arg {DOMElement} elem The DOM element to parse the track's properties from.
*/
	addToPlaylist: function (elem) {
		var track = Track.fromElement(elem)

		actions.dodo(function () {
			Playlist.add(track)
		}, function () {
			Playlist.remove(track)
		})

		elem.parentNode.removeChild(elem)
	},

/**
 * Adds multiple tracks to the playlist.
 *
 * @method FoundTrack
 * @static
 *
 * @arg {Array} elems The array of elements to parse the tracks' properties from.
*/
	addManyToPlaylist: function (elems) {
		tracks = elems.map(function (elem) {
			return Track.fromElement(elem)
		})

		actions.dodo(function () {
			tracks.forEach(function (track) {
				Playlist.add(track)
			})
		}, function () {
			tracks.forEach(function (track) {
				Playlist.remove(track)
			})
		})

		Search.hideResults()
	}
}

/**
 * A class to represent a track in the playlist.
 *
 * @class
*/
function Track (data) {
	this.data = data

	var fragment = document.createElement('div')
	fragment.innerHTML = template('list-track', this.data)

	this.elem = fragment.childNodes[1]
	this.elem.track = this

	this.buttons = {
		play: this.elem.querySelector('.btn.play'),
		remove: this.elem.querySelector('.btn.remove'),
		up: this.elem.querySelector('.btn.up'),
		down: this.elem.querySelector('.btn.down')
	}

	this.buttons.play.onclick = this.play.bind(this)
	this.buttons.remove.onclick = this.remove.bind(this)
	this.buttons.up.onclick = this.move.bind(this, 'up')
	this.buttons.down.onclick = this.move.bind(this, 'down')
}

/**
 * Gets the data from a DOM element and creates a Track of that data.
 *
 * @name fromElement
 * @method Track
 * @static
 *
 * @arg {DOMElement} elem The DOM element to get the data from.
 *
 * @return {Track} The new Track.
*/
Track.fromElement = function (elem) {
	return new Track({
		id: elem.dataset.id,
		title: elem.dataset.title,
		username: elem.dataset.username,
		permalink: elem.dataset.permalink,
		userPermalink: elem.dataset.userPermalink
	})
}

Track.prototype = {
/**
 * Removes the track from its playlist.
 *
 * @method Track
*/
	remove: function () {
		var track = this
		var index = Playlist.list.indexOf(track)

		actions.dodo(function () {
			Playlist.remove(track)
		}, function () {
			Playlist.add(track, index)
		})
	},

/**
 * Moves the track on the playlist.
 *
 * @method Track
 *
 * @arg {String|Number} index Either 'up' or 'down' or an absolute index.
*/
	move: function (index) {
		var track = this
		var oldIndex = Playlist.list.indexOf(track)

		if (index === 'up') index = oldIndex - 1
		else if (index === 'down') index = oldIndex + 1

		if (index < 0 || index === oldIndex) return
		if (index >= Playlist.list.length) {
			index = Playlist.list.length - 1
		}

		actions.dodo(function () {
			Playlist.remove(track)
			Playlist.add(track, index)
		}, function () {
			Playlist.remove(track)
			Playlist.add(track, oldIndex)
		})
	},

/**
 * Updates the track's UI.
 *
 * @method Track
*/
	update: function () {
		var index = Playlist.list.indexOf(this)

		this.buttons.up.disabled = !index
		this.buttons.down.disabled = index === Playlist.list.length - 1
	},

/**
 * Plays the track.
 *
 * @method Track
*/
	play: function () {
		Player.play(this)
	}
}

/**
 * A singleton interface for manipulating the current playlist.
 *
 * @class
 * @name Playlist
*/
var Playlist = {
	name: '',
	description: '',
	sname: '',
	list: [],

/**
 * Sets the name of the playlist and updates the UI accordingly.
 *
 * @method Playlist
 * @static
 *
 * @return {String} The new name.
*/
	setName: function (v) {
		Playlist.name = v
		playlistName.innerHTML = ''

		playlistName.appendChild(document.createTextNode(v))

		/* create a button to edit the name with */

		var btn = document.createElement('a')
		btn.className = 'edit'
		btn.title = 'Edit playlist name'
		btn.innerHTML = '<i class="icon-pencil"></i>'

		playlistName.appendChild(btn)

		btn.addEventListener('click', function () {
			var name = prompt(
				'Please enter new name:',
				Playlist.name
			)

			if (!name) return

			if (Playlists.getByName(name)) {
				alert('A playlist by that name already exists!')
				return
			}

			var oldName = Playlist.name

			actions.dodo(function () {
				Playlist.setName(name)
			}, function () {
				Playlist.setName(oldName)
			})
		})
	},

/**
 * Sets the description of the playlist and updates the UI accordingly.
 *
 * @method Playlist
 * @static
 *
 * @arg {String} v The new description.
*/
	setDescription: function (v) {
		Playlist.description = v
		playlistDescription.innerHTML = ''

		playlistDescription.appendChild(document.createTextNode(v))

		/* create a button to edit the description with */

		var btn = document.createElement('a')
		btn.className = 'edit'
		btn.title = 'Edit description'
		btn.innerHTML = '<i class="icon-pencil"></i>'

		playlistDescription.appendChild(btn)

		btn.addEventListener('click', function () {
			var description = prompt(
				'Please enter new description:',
				Playlist.description
			)

			if (!description) return

			var oldDescription = Playlist.description

			actions.dodo(function () {
				Playlist.setDescription(description)
			}, function () {
				Playlist.setDescription(oldDescription)
			})
		})
	},

/**
 * Loads a playlist based on its short name.
 *
 * @method Playlist
 * @static
 *
 * @arg {String} sname The short name of the playlist.
*/
	load: function (sname) {
		var list = Playlists.getByShortName(sname)

		this.setName(list.name)
		this.setDescription(list.description)
		this.sname = list.shortname

		this.list.splice(0, this.list.length)

		if (!list.list.length) return

		SC.get('/tracks', {
			ids: list.list.join(',')
		}, function (tracks) {
			tracks.forEach(function (track) {
				Playlist.add(new Track({
					id: track.id,
					title: track.title,
					username: track.username,
					permalink: track.permalink,
					userPermalink: track.user.permalink
				}))
			})
		})
	},

/**
 * Saves the playlist to the 'database'.
 *
 * @method Playlist
 * @static
*/
	save: function () {
		/* make sure we don't write over changes made elsewhere */
		Playlists.load()

		var list = Playlists.getByShortName(this.sname)

		list.name = this.name
		list.description = this.description
		list.list = this.list.map(function (track) {
			return track.data.id
		})

		Playlists.save()
	},

/**
 * Adds a track to the playlist and updates the UI accordingly.
 *
 * @method Playlist
 * @static
 *
 * @arg {Track} The track to add.
 * @arg {Number} !index The position to add to. If not specified, appends to the list.
*/
	add: function (track, index) {
		if (index >= 0 && this.list.length > index) {
			playlist.insertBefore(track.elem,
				this.list[index].elem)
			this.list.splice(index, 0, track)
		} else {
			playlist.appendChild(track.elem)
			this.list.push(track)
		}

		this.updateButtons()
	},

/**
 * Removes a track from the playlist and updates the UI accordingly.
 *
 * @method Playlist
 * @static
 *
 * @arg {Track} track The track to remove.
*/
	remove: function (track) {
		this.list.splice(this.list.indexOf(track), 1)
		playlist.removeChild(track.elem)

		this.updateButtons()
	},

/**
 * Updates the UI for all the tracks in the playlist.
 *
 * @method Playlist
 * @static
*/
	updateButtons: function () {
		this.list.forEach(function (track) {
			track.update()
		})
	}
}

/**
 * A singleton interface for manipulating the search functionality.
 *
 * @class
 * @name Search
*/
var Search = {
/**
 * Searches for the query and displays the results.
 *
 * @method Search
 * @static
 *
 * @arg {String} query The search query.
*/
	search: function (query) {
		SC.get('/tracks', { q: query }, function (tracks) {
			Search.showResults(tracks)
		})
	},

/**
 * Shows the results for a search.
 *
 * @method Search
 * @static
 *
 * @arg {Array} tracks The resulted tracks.
*/
	showResults: function (tracks) {
		results.classList.remove('hidden')

		if (!tracks.length) {
			results.innerHTML = 'Found nothing!'
			return
		}

		searchbox.addAll.disabled = false

		results.innerHTML = template('found-tracks', {
			tracks: tracks
		})
	},

/**
 * Hides the results box.
 *
 * @method Search
 * @static
*/
	hideResults: function () {
		results.classList.add('hidden')
		results.innerHTML = ''
		searchbox.addAll.disabled = true
	}
}

/**
 * A static interface for manipulating the player widget.
 *
 * @class
 * @name Player
*/
Player = {
	elem: document.getElementById('player'),
	widget: null,

/**
 * Starts playing the playlist at a specified track.
 *
 * @method Player
 * @static
 *
 * @arg {Track} track The track to play.
*/
	play: function (track) {
		if (nowPlaying) {
			nowPlaying.track.elem.classList.remove('playing')
			nowPlaying.track.buttons.play.disabled = false
		}

		if (!track) {
			nowPlaying = null
			return
		}

		nowPlaying = {
			track: track,
			index: Playlist.list.indexOf(track)
		}

		if (!this.widget) this.initWidget(track)

		track.elem.classList.add('playing')
		track.buttons.play.disabled = true

		this.widget.load('http://api.soundcloud.com/tracks/' +
			track.data.id)

		this.widget.bind(SC.Widget.Events.READY, function () {
			Player.widget.play()

			Player.widget.bind(SC.Widget.Events.FINISH, function () {
				var track = Playlist.list[nowPlaying.index + 1]

				Player.play(track)
			})
		})
	},

/**
 * Initializes the player widget.
 *
 * @method Player
 * @static
 *
 * @arg {Track} track The track to initially load the widget with.
*/
	initWidget: function (track) {
		this.elem.src = 'http://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/' +
			track.data.id
		this.widget = SC.Widget(this.elem)
	}
}

SC.initialize({
	client_id: '8b747e71b3a505f84053f2076e40727b'
})

/* load the current playlist based on the URL */
Playlist.load(location.pathname.split('/')[2])

/* initialize events here */

searchbox.onsubmit = function (e) {
	Search.search(this.search.value)

	e.preventDefault()
}

searchbox.addAll.onclick = function (e) {
	FoundTrack.addManyToPlaylist([].slice.call(
		results.getElementsByClassName('found-track')
	))

	e.preventDefault()
}

searchbox.save.onclick = function (e) {
	Playlist.save()

	/* TODO: Notify the user */

	e.preventDefault()
}

searchbox.playAll.onclick = function (e) {
	e.preventDefault()

	var track = Playlist.list[0]

	if (!track) return

	track.play()
}

document.documentElement.addEventListener('click', function (e) {
	if (isChildOf(e.target, searchbox)) return

	Search.hideResults()
}, true)

Mousetrap.bind(['command+z', 'ctrl+z'], function (e) {
	actions.undo()

	e.preventDefault()
})

Mousetrap.bind(['command+r', 'ctrl+r'], function (e) {
	actions.redo()

	e.preventDefault()
})

/* export some variables */
exports.Track = Track
exports.FoundTrack = FoundTrack
exports.Playlist = Playlist
exports.Player = Player

}(window)
