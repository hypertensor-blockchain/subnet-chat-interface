// import { hypertensorTuning } from "./hypertensor-hypertensorTuning.js";
// console.log(hypertensorTuning())
function hypertensorTuning() {
  return `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Hypertensor is a decentralized AI blockchain project focused on creating a modular, distributed framework for running AI workloads, such as inference and training, in a trustless and scalable way. Its goal is to decentralize AI infrastructure, ensuring fairness, transparency, and accessibility while removing reliance on centralized entities.

Key Features:
1. Subnets for Modular AI Workloads:

Hypertensor uses a system of subnets, where each subnet is 
decentralized AI application, like LLM inference or other types of workloads. This modularity allows for scalable and efficient operation.

2. True Decentralization:

Unlike centralized AI platforms, Hypertensor runs on a peer-to-peer network with fault-tolerant mechanisms, ensuring that no single entity controls the system.

3. Token Integration:

The platform utilizes TENSOR tokens to incentivize participants, enabling economic incentives for computation providers, node operators, and developers.

4. Vision for Open AI:

Hypertensor aligns with the idea of freeing AI from centralized control, enabling AI technologies to be run and accessed by humanity in an open, transparent, and censorship-resistant manner.

In Hypertensor, rewards are generated through a decentralized incentive mechanism that ensures active participation in maintaining and operating the network. Here's an overview of how rewards are generated and distributed:

1. Staking and Delegation Rewards
Participants can stake TENSOR tokens to support the activation and operation of subnets. Rewards are distributed to:

Delegators: Those who delegate their tokens to specific subnets to help them meet activation thresholds.
Subnet Operators: Node operators who participate in the consensus and execution of AI tasks.
Rewards incentivize both parties for their contribution to the network's growth and reliability.
<|eot_id|>



  `
  return `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>
A chat between a curious human and an artificial intelligence assistant. The assistant gives helpful and short summaries to the user's questions.

Here are some helpful tips about Hypertensor
Hypertensor is a decentralized & incentivized AI platform for decentralized AI applications and AI agents, known as subnets.

The Hypertensor blockchain uses a NPoS (nominated proof of stake) consensus mechanism where blockchain validators control the incentives and consensus of the subnets in the network. 

Subnets are incentivized intelligence & decentralized AI application with full-stack customizability.
Subnets are built by developers, similar to protocols on smart contracts platforms like Ethereum or Solana.
Hypertensor develops cutting-edge decentralized AI frameworks known as Subnet Standards. Developers can customize or deploy subnets using our pre-defined standards—such as the DSN (Decentralized Subnet) standard, which enables fully decentralized large language models through proof-of-stake and an innovative consensus mechanism called proof-of-inference.
Hypertensor is an incentivized intelligence platform for decentralized artificial intelligence applications. Each application operates within its own dedicated subnet, where specialized nodes collaborate to validate the application’s tasks, data, and the integrity of the subnet itself. This architecture ensures robust decentralization, seamless scalability, and a trustless environment for AI innovation.
Each Hypertensor subnet must have peer IDs and adhere to the Subnet Consensus Protocol (SCP) powered and validated by blockchain validators.

Subnets use PoS (proof of stake) and PoI (proof of inference) and are decentralized and distributed AI models validated by thousands of nodes.

The DSN (Decentralized Subnet) standard is for deploying decentralized AI models within the Hypertensor economy with other subnet validator nodes. The DSN has a PoS (Proof of Stake) consensus mechanism to enter the DHT (Distributed Hash Table) of the subnet's peer-to-peer network. This can be used to deploy decentralized AI models or AI agents in a fault-tolerant decentralized environment that follows the Hypertensor SCP (Subnet Consensus Protocol).
<|eot_id|>
`
}

var curModel = defaultModel;
const falconModel = "tiiuae/falcon-180B-chat";
const llama3Models = ["Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2"];

function getConfig() {
  return modelConfigs[curModel];
}

var hypertensorTuningAdded = false;

var ws = null;
var position = 0;
var testPosition = 0;
const initialSessionLength = 1024;
var sessionLength = initialSessionLength;
var connFailureBefore = false;

var totalElapsed, tokenCount;
let forceStop = false;
let waitingForInput = true;

function openSession() {
  let protocol = location.protocol == "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${protocol}//${location.host}/api/v2/generate`);
  ws.onopen = () => {
    ws.send(JSON.stringify({type: "open_inference_session", model: curModel, max_length: sessionLength}));
    ws.onmessage = event => {
      const response = JSON.parse(event.data);
      if (!response.ok) {
        handleFailure(response.traceback);
        return;
      }
      sendReplica();
    };
  };

  ws.onerror = _event => handleFailure(`Connection failed`);
  ws.onclose = _event => {
    if ($(".error-box").is(":hidden")) {
      handleFailure(`Connection was closed`, true);
    }
  };
}

function resetSession() {
  if (ws !== null && ws.readyState <= 1) {  // If readyState is "connecting" or "opened"
    ws.close();
  }
  ws = null;
  position = 0;
}

function isWaitingForInputs() {
  const classNames = $("#ready").attr("class");
  return classNames == "ready"
}

function sendReplica() {
  if (isWaitingForInputs()) {
    const aiPrompt = "Assistant:";
    $("#ready").attr('class', '');

    // $('.dialogue').append($(
    //   `<p class="ai-human">Human: ${$('.human-replica:last textarea').val()}</p>`
    // ))

    $('.dialogue').append($(
      `<div class="flex justify-end">` +
        `<div class="ai-human rounded-lg p-3 max-w-xs">` +
          `Human: ${$('.human-replica:last textarea').val()}` +
        `</div>` +
      `</div>`
    ))

    $(".human-replica:last textarea").prop("disabled", true);
    $("#human-replica-submit").prop("disabled", true);
    $("#audio-start").prop("disabled", true);

    // $('.dialogue').append($(
    //   '<p class="ai-replica flex flex-col gap-2 scroll-smooth scroll-auto">' +
    //     `<span><img src="./static/logo.svg" width="16" height="16" class="invert"></span>` +
    //     `<span class="text ai-text whitespace-pre-line">${aiPrompt}</span>` +
    //     '<span class="loader"></span>' +
    //     '<span class="speed" style="display: none;"></span>' +
    //     '<span class="generation-controls"><a class="stop-generation" href=#>stop generation</a></span>' +
    //     '<span class="suggest-join" style="display: none;">' +
    //       '<b>Too slow?</b> ' +
    //       '<a target="_blank" href="https://github.com/hypertensor-blockchain/subnet-llm-template">Connect your GPU</a> ' +
    //       'and increase the Subnets capacity!' +
    //     '</span>' +
    //   '</p>'));

    $('.dialogue').append($(
      `<div class="flex justify-start scroll-smooth scroll-auto">` +
        `<div class="ai-replica rounded-lg p-3 max-w-xs flex">` +
          `<span><img src="./static/logo.svg" width="16" height="16" class="invert"></span>` +
          `<span class="text ai-text whitespace-pre-line">${aiPrompt}</span>` +
          '<span class="loader"></span>' +
          '<span class="speed" style="display: none;"></span>' +
          '<span class="generation-controls"><a class="stop-generation" href=#>stop generation</a></span>' +
          '<span class="suggest-join" style="display: none;">' +
            '<b>Too slow?</b> ' +
            '<a target="_blank" href="https://github.com/hypertensor-blockchain/subnet-llm-template">Connect your GPU</a> ' +
            'and increase the Subnets capacity!' +
          '</span>' +
        `</div>` +
      `</div>`
    ));

    // $('body, html').animate({ scrollTop: $(".ai-replica:last").offset().top }, 1000);
    // $('.dialogue').animate({ scrollTop: $(".ai-replica:last").offset().top }, 1000);
    // $(".dialogue").animate({ scrollTop: $(".ai-replica:last").height()-$(window).height()}, 200);
    // $(".dialogue").animate({ scrollTop: $(".ai-replica:last").scrollTop() }, 1000);

    scrollToBottom();

    $('.stop-generation').click(e => {
      e.preventDefault();
      forceStop = true;
    });
  } else {
    $('.loader').show();
  }

  if (ws === null) {
    openSession();
    return;
  }

  let prependPhrase = "give me a short response to the following: ";
  const replicaDivs = $('.ai-human, .ai-replica .text');

  var replicas = [];
  for (var i = position; i < replicaDivs.length; i++) {
    const el = $(replicaDivs[i]);
    let phrase = el.text();

    if (curModel === falconModel) {
      if (i < 2) {
        // Skip the system prompt and the 1st assistant's message to match the HF demo format precisely
        continue;
      }
      phrase = phrase.replace(/^Human:/, 'User:');
      phrase = phrase.replace(/^Assistant:/, 'Falcon:');
    }
    
    if (llama3Models.includes(curModel)) {
      if (hypertensorTuningAdded == false) {
        if (phrase.includes("hypertensor")) {
          console.log("included")
          replicas.push(hypertensorTuning());
          hypertensorTuningAdded = true;
        }
      }
    }

    if (llama3Models.includes(curModel)) {
      if (i < 2) {
        // Skip the system prompt and the 1st assistant's message to match the HF demo format precisely
        continue;
      }
      phrase = phrase.replace(/^Human:/, `<|start_header_id|>user<|end_header_id|>: ${prependPhrase}`);
      phrase = phrase.replace(/^Assistant:/, '<|start_header_id|>assistant<|end_header_id|>:');
    }

    if (el.is(".ai-human")) {
      phrase += getConfig().chat.sep_token;
    } else if (i < replicaDivs.length - 1) {
      phrase += getConfig().chat.stop_token;
    }

    replicas.push(phrase);
  }

  const inputs = replicas.join("");

  position = replicaDivs.length;

  totalElapsed = 0;
  tokenCount = 0;
  receiveReplica(inputs);
}

function receiveReplica(inputs) {
  waitingForInput = true;

  if (inputs.length == 0) {
    appendTextArea();
  }
  
  ws.send(JSON.stringify({
    type: "generate",
    inputs: inputs,
    max_new_tokens: 1,
    stop_sequence: getConfig().chat.stop_token,
    extra_stop_sequences: getConfig().chat.extra_stop_sequences,
    ...getConfig().chat.generation_params,
  }));

  var lastMessageTime = null;
  ws.onmessage = event => {
    connFailureBefore = false;  // We've managed to connect after a possible failure

    waitingForInput = false;

    const response = JSON.parse(event.data);
    if (!response.ok) {
      handleFailure(response.traceback);
      return;
    }

    console.log("response", response)

    if (lastMessageTime != null) {
      totalElapsed += performance.now() - lastMessageTime;
      tokenCount += response.token_count;
    }
    lastMessageTime = performance.now();

    const lastReplica = $('.ai-replica .text').last();
    var newText = lastReplica.text() + response.outputs;

    if (llama3Models.includes(curModel)) {
      newText = newText.replace("<|begin_of_text|>", "");
      newText = newText.replace("<|end_of_text|>", "");
      newText = newText.replace(getConfig().chat.stop_token, "");
    }
    if (curModel !== falconModel) {
      newText = newText.replace(getConfig().chat.stop_token, "");
    }
    if (getConfig().chat.extra_stop_sequences !== null) {
      for (const seq of getConfig().chat.extra_stop_sequences) {
        newText = newText.replace(seq, "");
      }
    }

    lastReplica.text(newText);
    // $('.dialogue').animate({ scrollTop: $(".ai-replica:last").offset().top }, 500);

    if (!response.stop && !forceStop) {
      if (tokenCount >= 1) {
        const speed = tokenCount / (totalElapsed / 1000);
        $('.speed')
          .text(`Speed: ${speed.toFixed(1)} tokens/sec`)
          .show();
        if (speed < 1) {
          $('.suggest-join').show();
        }
      }
    // } else if (response.server_sessions_data) {
    //   console.log("response.server_sessions_data", response.server_sessions_data)
    } else {
      if (forceStop) {
        resetSession();
        forceStop = false;
      }

      renderOutput(newText)

      $('.loading-animation, .loader, .speed, .suggest-join, .generation-controls').remove();
      newText = newText.replace("Assistant: ", "");
      newText = newText.replace(/"/g, "'");

      $(".ai-replica:last").append(
        `<span class="flex flex-row gap-3">` +
          `<button type="button" class="text-to-speech-button transition disabled:opacity-15 hover:bg-neutral-700 rounded-full p-1 text-center inline-flex items-center" value="${newText}" >` +
            `<img class="w-4 h-4 invert" src="./static/speech.svg">` +
          `</button>` +
        `</span>`
      );    
      appendTextArea();
    }
  };
}

function handleFailure(message, autoRetry = false) {
  resetSession();
  if (!isWaitingForInputs()) {
    // Show the error and the retry button only if a user is waiting for the generation results

    if (message === "Connection failed" && !connFailureBefore) {
      autoRetry = true;
      connFailureBefore = true;
    }
    if (/Session .+ expired/.test(message)) {
      autoRetry = true;
    }
    const maxSessionLength = getConfig().chat.max_session_length;

    if (/Maximum length exceeded/.test(message) && sessionLength < maxSessionLength) {
      // We gradually increase sessionLength to save server resources. Default: 512 -> 2048 -> 8192 (if supported)
      sessionLength = Math.min(sessionLength * 4, maxSessionLength);
      autoRetry = true;
    }

    if (autoRetry) {
      retry();
    } else {
      $('.loader').hide();
      if (/attention cache is full/.test(message)) {
        $('.error-message').hide();
        $('.out-of-capacity').show();
      } else {
        $('.out-of-capacity').hide();
        $('.error-message').text(message).show();
      }
      $('.error-box').show();
    }
  }
}

function retry() {
  $('.error-box').hide();
  sendReplica();
}

function speak(text) {

  const utterance = new SpeechSynthesisUtterance(text);

  const synth = window.speechSynthesis;

  // 2 is nice
  utterance.voice = synth.getVoices()[13];

  return new Promise(resolve => {
    utterance.onend = () => {
      resolve(); // Resolve the promise when speech is done
    };

    synth.speak(utterance);
  });
}

let currentStream = null;

function startAudioVisualizer() {
  const audioModal = $('#audio-visualizer');
  audioModal.show()
  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const audioStream = audioContext.createMediaStreamSource(stream);
    audioStream.connect(analyser);
    currentStream = stream

    visualize(analyser);

    // Clear the timer if speech is detected again
    analyser.onaudioprocess = function() {
      clearTimeout(stopTimer);
    };    
  })
  .catch(err => {
    console.error('Error accessing audio stream:', err);
  });
}

function speechToText() {
  const audioStartButton = document.getElementById('audio-start');
  const audioStartImg = document.getElementById('audio-start-img');
  const stopButton = document.getElementById('push-to-stop');
  const audioModal = $('#audio-visualizer');

  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
  recognition.lang = 'en-US';
  
  recognition.onstart = () => {
    startAudioVisualizer()
    audioStartImg.classList.add("animate-ping");
  };
  
  stopButton.addEventListener('click', () => {
    recognition.abort();

    if (currentStream != null) {
      currentStream.getTracks().forEach(track => track.stop()); 
    }
    audioModal.hide()  
    audioStartImg.classList.remove("animate-ping");
    focusTextArea()
  });  

  recognition.onspeechend = () => {
    recognition.stop();
    // remove visualizer
    if (currentStream != null) {
      currentStream.getTracks().forEach(track => track.stop()); 
    }
    audioModal.hide()  
    audioStartImg.classList.remove("animate-ping");
    focusTextArea()
  };
  
  const textarea = $('.human-replica:last textarea');
  recognition.onresult = (event) => {
    // remove button to talk
    const transcript = event.results[0][0].transcript;
    textarea.val(textarea.val() + " " + transcript);
    if (currentStream != null) {
      currentStream.getTracks().forEach(track => track.stop()); 
    }
    focusTextArea()
  };
    
  audioStartButton.addEventListener('click', () => {
    recognition.start();
  });  
}

function visualize(analyser) {
  const canvas = document.getElementById('visualizer');
  const canvasContext = canvas.getContext('2d');
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let barHeight;
    let x = 0;

    g = 255

    for (let i = 0; i < bufferLength; i++) {
      // b = Math.random() * (255 - 0) + 0; // was 0
      barHeight = dataArray[i];
      // canvasContext.fillStyle = `rgb(${255-barHeight},${g},${0})`;
      canvasContext.fillStyle = `rgb(${barHeight},${g},0)`;
      canvasContext.fillRect(x, canvas.height - barHeight / 5, barWidth, barHeight / 5);
      x += barWidth + 1;
    }
  }

  draw();
}

function renderOutput(responseText) {
  const elements = document.querySelectorAll('.ai-replica .text');
  const outputDiv = elements[elements.length - 1];

  const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
  const inlineCodeRegex = /`([^`]+)`/g;

  let formattedResponse = responseText;
  formatted = false;

  if (codeBlockRegex.test(responseText)) {
    formattedResponse = formattedResponse.replace(codeBlockRegex, function(match, lang, code) {
      formatted = true;
      return `<pre><code class="hljs ${lang}">${(code)}</code></pre>`;
    });
    outputDiv.innerHTML = formattedResponse;
    hljs.highlightAll(); // Highlight the code after rendering
  }


  if (inlineCodeRegex.test(responseText)) {
    formattedResponse = formattedResponse.replace(inlineCodeRegex, function(match, code) {
      formatted = true;
      return `<code>${(code)}</code>`;
    });
    outputDiv.innerHTML = formattedResponse;
    hljs.highlightAll(); // Highlight the code after rendering
  }

  if (formatted) {
    outputDiv.innerHTML = formattedResponse;
    hljs.highlightAll(); // Highlight the code after rendering
  }
}

function appendTextArea() {
  // $('body, html').animate({ scrollTop: $(".ai-replica:last").offset().top }, 1000);
  // $('.dialogue').animate({ scrollTop: $(".ai-replica:last").offset().top }, 500);
  // $(".dialogue").animate({ scrollTop: $(".ai-replica:last").height()-$(window).height()}, 200);
  // $('.dialogue').animate({ scrollTop: $(".ai-replica:last").offset().top }, 1000);
  scrollToBottom();
  $('.chat-section').empty();
  $('.human-replica:last').remove();

  // $('.chat-section').append($(
  //   `<div class="human-replica flex items-center pr-3 py-2 gap-3">` +
  //   `<textarea rows="2" placeholder="Message GPT" class="disabled:text-neutral-500 block w-full resize-none rounded-2xl bg-zinc-800 px-3 py-1.5 text-zinc-50 outline outline-0 out line-gray-300 placeholder:text-gray-400 focus:outline focus:outline-0 focus:-outline-offset-2 sm:text-sm/6"></textarea>` +
  //     `<button type="submit" id="human-replica-submit" class="items-center disabled:bg-neutral-500 disabled:hover:bg-zinc-500 disabled:cursor-default inline-flex justify-center p-0 text-gray-950 rounded-full cursor-pointer bg-zinc-50 hover:hover:bg-zinc-300">` +
  //     `<svg width="23" height="23" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-2xl"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z" fill="currentColor"></path></svg>` +
  //   `</button>` +
  //   `<button id="audio-start" class="items-center w-[23px] h-[23px] min-w-[23px] min-h-[23px] rounded-full disabled:bg-neutral-500 disabled:hover:bg-zinc-500 disabled:cursor-default inline-flex justify-center p-0 text-gray-950 rounded-full cursor-pointer bg-zinc-50 hover:bg-zinc-300 items-center">` +
  //     `<img class="h-5 w-auto" src="./static/audio-waves.svg" id="audio-start-img">` +
  //   `</button>` +
  // `</div>`
  // ))
  $('.chat-section').append($(
    `<div class="chat-section">` +
      `<div class="human-replica flex items-center gap-3">` +
        `<textarea rows="2" placeholder="Message GPT" class="disabled:text-neutral-500 block w-full resize-none rounded-2xl bg-zinc-800 px-3 py-1.5 text-zinc-50 outline outline-0 out line-gray-300 placeholder:text-gray-400 focus:outline focus:outline-0 focus:-outline-offset-2 sm:text-sm/6"></textarea>` +
        `<button type="submit" id="human-replica-submit" class="items-center disabled:bg-neutral-500 disabled:hover:bg-zinc-500 disabled:cursor-default inline-flex justify-center p-0 text-gray-950 rounded-full cursor-pointer bg-zinc-50 hover:bg-zinc-300">` +
          `<svg width="23" height="23" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-2xl"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z" fill="currentColor"></path></svg>` +
        `</button>` +
        `<button id="audio-start" class="items-center w-[23px] h-[23px] min-w-[23px] min-h-[23px] rounded-full disabled:bg-neutral-500 disabled:hover:bg-zinc-500 disabled:cursor-default inline-flex justify-center p-0 text-gray-950 rounded-full cursor-pointer bg-zinc-50 hover:bg-zinc-300 items-center">` +
          `<img class="h-5 w-auto" src="./static/audio-waves.svg" id="audio-start-img">` +
        `</button>` +
      `</div>` +
    `</div>`
  ))

  upgradeTextArea();
}

function scrollToBottom() {
  const chatArea = $('#chat-area');
  chatArea.animate({ scrollTop: chatArea[0].scrollHeight }, 500); // 500ms animation
}

function focusTextArea() {
  const textarea = $('.human-replica:last textarea');
  autosize(textarea);
  textarea[0].selectionStart = textarea[0].value.length;
  textarea.focus();
}

function upgradeTextArea() {
  $("#ready").attr('class', 'ready');
  const textarea = $('.human-replica:last textarea');
  autosize(textarea);
  textarea[0].selectionStart = textarea[0].value.length;
  textarea.focus();

  textarea.on('keypress', e => {
    if (e.which == 13 && !e.shiftKey) {
      console.log("keypress", e.currentTarget.value);
      e.preventDefault();
      // don't submit unless there is an input value
      if (e.currentTarget.value.length == 0) {
        return;
      }
      sendReplica();
    }
  });

  const submitButton = $('#human-replica-submit');
  submitButton.on('click', e => {
    e.preventDefault();
    // don't submit unless there is an input value
    if ($('.human-replica:last textarea').val().length == 0) {
      return;
    }
    if (!isWaitingForInputs()) {
      return;
    }   
    sendReplica();
  });

  speechToText();
}

function enableAllSpeech() {
  const elements = document.getElementsByClassName('text-to-speech-button');
  Array.from(elements).forEach(function(element) {
    element.disabled = false;
  });
}

function disableAllSpeech() {
  const elements = document.getElementsByClassName('text-to-speech-button');
  Array.from(elements).forEach(function(element) {
    element.disabled = true;
  });
}

const animFrames = ["⌛", "🧠"];
var curFrame = 0;

$(() => {
  upgradeTextArea();
  const seenDeaiMessage = localStorage.getItem("deai-message");

  // KEEP THIS
  // const audioButton = document.getElementById('audioButton');
  // audioButton.addEventListener('click', async function() {
  //   if (audioButton.classList.contains('active')) {
  //     synth.cancel()
  //     audioButton.classList.toggle('active');
  //     enableAllSpeech()
  //   } else {
  //     audioButton.classList.toggle('active');
  //     disableAllSpeech()
  //     const textValue = this.value
  //     await speak(textValue);
  //     audioButton.classList.toggle('active');
  //     enableAllSpeech()
  //   }
  // });

  document.addEventListener('click', async function(event) {
    const button = event.target.closest('.text-to-speech-button');
    if (button) {
      // const parent = event.target.parentElement;
      disableAllSpeech()
      await speak(button.value);
      event.preventDefault();
      enableAllSpeech()
    }
  });
  
  if (JSON.parse(seenDeaiMessage) != true) {
    $('#modal-deai-message').show();
  }

  const modalCloseButton = $('#modal-deai-close');
  modalCloseButton.on('click', e => {
    e.preventDefault();
    localStorage.setItem("deai-message", true);
    $('#modal-deai-message').hide();
  });

  $('.family-selector label').click(function (e) {
    if (!isWaitingForInputs()) {
      alert("Can't switch the model while the AI is writing a response. Please refresh the page");
      e.preventDefault();
      return;
    }

    const radio = $(`#${$(this).attr("for")}`);
    if (radio.is(":checked")) {
      setTimeout(() => $('.human-replica textarea').focus(), 10);
      return;
    }

    const curFamily = radio.attr("value");
    $('.model-selector').hide();
    const firstLabel = $(`.model-selector[data-family=${curFamily}]`).show().children('label:first');
    firstLabel.click();
    firstLabel.trigger('click');
  });
  $('.model-selector label').click(function (e) {
    if (!isWaitingForInputs()) {
      alert("Can't switch the model while the AI is writing a response. Please refresh the page");
      e.preventDefault();
      return;
    }

    curModel = $(`#${$(this).attr("for")}`).attr("value");
    $('.dialogue p').slice(2).remove();

    sessionLength = initialSessionLength;
    resetSession();
    appendTextArea();

    $('.model-name')
      .text($(this).text())
      .attr('href', getConfig().frontend.model_card);
    $('.license-link').attr('href', getConfig().frontend.license);
    setTimeout(() => $('.human-replica textarea').focus(), 10);
  });
  $('.retry-link').click(e => {
    e.preventDefault();
    retry();
  });
});
