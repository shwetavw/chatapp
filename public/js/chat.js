const socket = io()

//Elements
const $messageForm = document.querySelector('#chatForm')
const $messageFormInput = $messageForm.querySelector('input')
const $formButtonSend = $messageForm.querySelector('#btnSend')
const $formButtonSendLocation = document.querySelector('#btnSendLocation')
const $divMessage = document.querySelector('#divMessage')
const $divSidebar = document.querySelector('#sidebar')

//Templates
const $messageTemplate = document.querySelector('#messageTemplate').innerHTML
const $locationTemplate = document.querySelector('#locationTemplate').innerHTML
const $sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML

//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoscroll = ()=>{
    //get latest message div element
    const $latestMessage = $divMessage.lastElementChild

    //get latest message all the style
    const latestMessageStyle = getComputedStyle($latestMessage)
    //get latest message element margin i.e. div margin
    const latestMessageMargin = parseInt(latestMessageStyle.marginBottom)
    //get latest message element total height
    const latestMessageHeight = $latestMessage.offsetHeight + latestMessageMargin

    //To get container height and visible height to check the current position and set the scroll
    const visibleHeight = $divMessage.offsetHeight
    const containerHeight = $divMessage.scrollHeight
    const scrollOffset = $divMessage.scrollTop + visibleHeight

    if((Math.round(containerHeight-latestMessageHeight-1)) <= Math.round(scrollOffset)){
        $divMessage.scrollTop = $divMessage.scrollHeight
    }
}

socket.on('message',(message)=>{
    const html = Mustache.render($messageTemplate,{
        message : message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })

    $divMessage.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    const html = Mustache.render($locationTemplate,{
        url : url.url,
        createdAt: moment(url.createdAt).format('h:mm a'),
        username: url.username
    })

    $divMessage.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })

    $divSidebar.innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable elements
    $formButtonSend.setAttribute('disabled','disabled')
    socket.emit('sendMessage', {messagetext: $messageFormInput.value, username, room}, (message)=>{
        //enable elements
        $formButtonSend.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        console.log('Message delivered.'+message)
    })
    
})

$formButtonSendLocation.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return console.log('Geolocation is not supported by your browser')
    }

    $formButtonSendLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
              socket.emit('sendLocation',{
                  latitude: position.coords.latitude, 
                  longitude: position.coords.longitude,
                  username, 
                  room
                },(message)=>{
                    $formButtonSendLocation.removeAttribute('disabled')
                    console.log('Client send, waiting for server acknowledment. '+message)
                })
    })
})

socket.emit('join',{username, room}, (error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }
})