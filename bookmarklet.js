void ($('div.player').each(function () {
	var $player = $(this)
	var $actions = $('.actions>.primary', $player)
	var trackid = $player.attr('data-sc-track')
	var $addbutton = $('<a href="#" valign="middle"><span>Add to playlist</span></a>')

	$addbutton.css({
		position: 'relative',
		color: '#222',
		padding: '5px 8px',
		borderRight: '1px solid #ccc'
	})
	$('span', $addbutton).css({
		fontSize: '10px'
	})

	var iframe = null

	$addbutton.click(function (e) {
		if (iframe) return

		iframe = document.createElement('iframe')
		iframe.src = 'http://cloudlist.avd.io/add-to-playlist.html?id=' + trackid
		iframe.width = '400'
		iframe.height = '300'
		iframe.frameborder = 'no'

		$(iframe).css({
			position: 'fixed',
			display: 'block',
			border: '1px solid #ccc',
			left: (e.pageX - window.scrollX) + 'px',
			top: (e.pageY - window.scrollY) + 'px',
			borderRadius: '6px',
			zIndex: '9999'
		})

		$('body').append($(iframe))

		window.addEventListener('message', function l (e) {
			if (e.data !== 'close-playlist-overlay') return

			window.removeEventListener('message', l, true)

			document.body.removeChild(iframe)
			iframe = null
		}, true)

		e.preventDefault()
	})

	$actions.append($addbutton)
}))
