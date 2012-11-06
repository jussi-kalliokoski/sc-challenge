var actions = new UndoList()
var nowPlaying = null

function isChildOf (elem, parent) {
	while (elem.parentNode) {
		if (elem.parentNode === parent) return true

		elem = elem.parentNode
	}

	return false
}

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

var FoundTrack = {
	addToPlaylist: function (elem) {
		var track = new Track(elem)

		actions.dodo(function () {
			Playlist.add(track)
		}, function () {
			Playlist.remove(track)
		})

		elem.parentNode.removeChild(elem)
	},

	addManyToPlaylist: function (elems) {
		tracks = elems.map(function (elem) {
			return new Track(elem)
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

function Track (elem) {
	this.data = {
		id: elem.dataset.id,
		title: elem.dataset.title,
		username: elem.dataset.username,
		permalink: elem.dataset.permalink,
		userPermalink: elem.dataset.userPermalink
	}

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
}

Track.prototype = {
	remove: function () {
		var track = this
		var index = Playlist.list.indexOf(track)

		actions.dodo(function () {
			Playlist.remove(track)
		}, function () {
			Playlist.add(track, index)
		})
	},

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

	update: function () {
		var index = Playlist.list.indexOf(this)

		this.buttons.up.disabled = !index
		this.buttons.down.disabled = index === Playlist.list.length - 1
	},

	play: function () {
		Player.play(this)
	}
}

var Playlist = {
	list: [],

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

	remove: function (track) {
		this.list.splice(this.list.indexOf(track), 1)
		playlist.removeChild(track.elem)

		this.updateButtons()
	},

	updateButtons: function () {
		this.list.forEach(function (track) {
			track.update()
		})
	}
}

var Search = {
	search: function (query) {
		SC.get('/tracks', { q: query }, function (tracks) {
			Search.showResults(tracks)
		})
	},

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

	hideResults: function () {
		results.classList.add('hidden')
		results.innerHTML = ''
		searchbox.addAll.disabled = true
	}
}

SC.initialize({
	client_id: '8b747e71b3a505f84053f2076e40727b'
})

Player = {
	elem: document.getElementById('player'),
	widget: null,

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

	initWidget: function (track) {
		this.elem.src = 'http://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/' +
			track.data.id
		this.widget = SC.Widget(this.elem)
	}
}

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

document.addEventListener('click', function (e) {
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
