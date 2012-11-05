var actions = new UndoList()

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
				playlist.remove(track)
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
	},

	remove: function (track) {
		this.list.splice(this.list.indexOf(track), 1)
		playlist.removeChild(track.elem)
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
