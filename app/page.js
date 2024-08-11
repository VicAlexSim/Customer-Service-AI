'use client';
import { Box, Button, Stack, TextField, IconButton, Tooltip } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Image from "next/image";
import { useState } from "react";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';

// Create a dark theme using Material-UI's theming system
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BB86FC',
    },
    secondary: {
      main: '#03DAC6',
    },
    background: {
      default: 'rgba(31, 27, 36, 0.9)', // Add a slight transparency to ensure the background image is slightly visible
      paper: 'rgba(31, 27, 36, 0.8)',  // Ensure text and buttons stand out over the background image
    },
    text: {
      primary: '#ffffff',
    },
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am the Shopping List Extension Support Agent, how can I assist you today?',
    },
  ]);
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: '' },
    ]);

    setMessage('');

    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    return reader.read().then(function processText({ done, value }) {
      if (done) {
        return result;
      }
      const text = decoder.decode(value || new Int8Array(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);

        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text,
          },
        ];
      });
      return reader.read().then(processText);
    });
  };

  const regenerateLastMessage = async () => {
    const lastMessage = messages.filter((msg) => msg.role === 'user').slice(-1)[0];
    if (!lastMessage) return;

    setMessages((messages) => [
      ...messages,
      { role: "assistant", content: '' },
    ]);

    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, { role: 'user', content: lastMessage.content }])
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    return reader.read().then(function processText({ done, value }) {
      if (done) {
        return result;
      }
      const text = decoder.decode(value || new Int8Array(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);

        return [
          ...otherMessages,
          {
            ...lastMessage,
            content: lastMessage.content + text,
          },
        ];
      });
      return reader.read().then(processText);
    });
  };

  const handleFeedback = (index, type) => {
    console.log(`User gave a ${type} rating for message at index ${index}`);
    // You can send this feedback to your server or handle it however you need
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box 
        width="100vw" 
        height="100vh" 
        display="flex" 
        justifyContent="center"
        alignItems="center"
        padding={4}
        className="fade-in-up"
      >
        <Stack
          direction="row"
          spacing={4}
          alignItems="center"
          width="100%"
          maxWidth="1200px"
        >
          {/* Left side: Image of a robot */}
          <Box width="40%" className="fade-in-up">
            <Image 
              src="/icons/robot.png" // Ensure this path matches the image's location
              alt="Robot"
              width={400}
              height={400}
              style={{ width: '100%', height: 'auto' }}
            />
          </Box>

          {/* Right side: Chatbot interface */}
          <Box 
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            className="fade-in-up"
          >
            <Stack
              direction="column"
              width="100%"
              height="700px"
              border="1px solid #BB86FC"
              p={2}
              spacing={3}
              bgcolor="background.paper"
            >
              <Stack
                direction="column"
                spacing={2}
                flexGrow={2}
                overflow="auto"
                maxHeight="100%"
              >
                {
                  messages.map((message, index) => (
                    <Box 
                      key={index} 
                      display='flex' 
                      flexDirection="column"
                      alignItems={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                    >
                      <Box 
                        bgcolor={
                          message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                        }
                        color="white"
                        borderRadius={16}
                        p={3}
                        position="relative"
                      >
                        {message.content}
                        {message.role === 'assistant' && (
                          <Box mt={1} display="flex" justifyContent="flex-start">
                            <Tooltip title="Regenerate response">
                              <IconButton 
                                size="small" 
                                onClick={() => regenerateLastMessage()}
                                sx={{ color: '#03DAC6' }}
                              >
                                <AutorenewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Thumbs up">
                              <IconButton 
                                size="small" 
                                onClick={() => handleFeedback(index, 'positive')}
                                sx={{ color: '#03DAC6' }}  // Ensure all buttons have the same color
                              >
                                <ThumbUpIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Thumbs down">
                              <IconButton 
                                size="small" 
                                onClick={() => handleFeedback(index, 'negative')}
                                sx={{ color: '#03DAC6' }}  // Match color with the other buttons
                              >
                                <ThumbDownIcon />
                              </IconButton>
                            </Tooltip>
                            <CopyToClipboard text={message.content}>
                              <Tooltip title="Copy text">
                                <IconButton 
                                  size="small"
                                  sx={{ color: '#03DAC6' }}  // Match color with the other buttons
                                >
                                  <ContentCopyIcon />
                                </IconButton>
                              </Tooltip>
                            </CopyToClipboard>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))
                }
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Message"
                  fullWidth
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button variant="contained" onClick={sendMessage}>
                  Send
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
