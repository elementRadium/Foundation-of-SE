window.onload = function() {
    var hichat = new HiChat();
    hichat.init();
};

var HiChat = function() {
    this.socket = null;
};

HiChat.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();

        this.socket.on('connect', function() {
            document.getElementById('info').textContent = 'get yourself a nickname :)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });

        this.socket.on('nickExisted', function() {
          document.getElementById('info').textContent = '!nickname is taken, choose another pls';
        });

        this.socket.on('loginSuccess', function() {
          document.title = 'FSE chatroom ' + document.getElementById('nicknameInput').value;
          document.getElementById('loginWrapper').style.display = 'none';
          document.getElementById('messageInput').focus();
        });

        this.socket.on('system', function(nickName, userCount, type) {
          var msg = 'Notice here: ' + nickName + (type == 'login' ? ' joined' : ' left');
          var p = document.createElement('p');
          p.textContent = msg;
          p.id = 'p_35';
          p.style.color ='red';
          document.getElementById('historyMsg').appendChild(p);
          document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
          //that._displayNewMsg('admin ', msg, 'red');
          //document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
        });

        document.getElementById('loginBtn').addEventListener('click', function() {
          var nickName = document.getElementById('nicknameInput').value;
          if (nickName.trim().length != 0) {
              that.socket.emit('login', nickName);
          } else {
              document.getElementById('nicknameInput').focus();
          };
        }, false);

        document.getElementById('sendBtn').addEventListener('click', function() {
          var messageInput = document.getElementById('messageInput');
          var msg = messageInput.value;
          messageInput.value = '';
          messageInput.focus();
          if (msg.trim().length != 0) {
            that.socket.emit('postMsg', msg);
            that._displayNewMsg('me', msg);
          };
        }, false);

        this.socket.on('newMsg', function(user, msg) {
          that._displayNewMsg(user, msg);
        });

        this.socket.on('loadHistory', function(user, msg) {
          that._displayNewMsg(user+'*', msg);
        });

    } ,

    _displayNewMsg: function(user, msg, color){
      /**
      <div id="msgWrapper">
        <div id="userTag"></div>
        <div id="timeStamp"></div>
        <div id="msgContent"><div>
      </div>
      */
      var myDate = new Date();
      var container = document.getElementById('historyMsg');

      var msgWrapperElement = document.createElement('div');
      msgWrapperElement.id = 'msgWrapper';

      var userTagElement = document.createElement('div');
      userTagElement.id = 'userTag';
      var timeStampElement = document.createElement('div');
      timeStampElement.id = 'timeStamp';
      var msgContentElement = document.createElement('div');
      msgContentElement.id = 'msgContent';

      var user_p= document.createElement('p');
      user_p.innerHTML=user;
      var ts_p= document.createElement('p');
      ts_p.innerHTML= '<span class="timespan">' + (myDate.getMonth() + 1)+'.' + myDate.getDate()+ '.' +myDate.getFullYear() +'  '+ myDate.toTimeString().substr(0, 5) + ' </span>';
      var msg_p =document.createElement('p');
      msg_p.innerHTML=msg;
      msg_p.id ='msg';


      userTagElement.appendChild(user_p);
      msgWrapperElement.appendChild(userTagElement);
      timeStampElement.appendChild(ts_p);
      msgWrapperElement.appendChild(timeStampElement);
      msgContentElement.appendChild(msg_p);
      msgWrapperElement.appendChild(msgContentElement);
      container.appendChild(msgWrapperElement);

      msg_p.id='textctrl';

      // var msgToDisplay = document.createElement('p');
      // var msgContent =   document.createElement('p');
      // msgContent.id = 'msg2Dis'
      // var year = myDate.getFullYear();
      // var month = myDate.getMonth();
      // var day = myDate.getDate();
      // msgToDisplay.style.color = color || '#000';
      // //msgToDisplay.stype.text-align = center;
      // msgToDisplay.innerHTML = user + '<span class="timespan">(' + (myDate.getMonth() + 1)+'.' + myDate.getDate()+ '.' +myDate.getFullYear() +'  '+ myDate.toTimeString().substr(0, 5) + ') </span>';
      // msgContent.innerHTML = msg;
      // container.appendChild(msgToDisplay);
      // container.appendChild(msgContent);
      container.scrollTop = container.scrollHeight;
    }

};
