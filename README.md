# AI Chat Application

A modern, real-time AI chat application built with Next.js frontend and Django backend, featuring streaming responses and a beautiful, professional UI.

## 🚀 Features

- **Real-time Chat**: Interactive AI conversations with streaming responses
- **Modern UI**: Clean, professional design with vibrant blue accents
- **Typewriter Effect**: Smooth text animation for AI responses
- **Auto-focus**: Seamless typing experience with automatic input focus
- **Responsive Design**: Works perfectly on desktop and mobile
- **Component Architecture**: Modular, reusable React components
- **TypeScript**: Full type safety throughout the application

## 🏗️ Architecture

### Frontend (Next.js 15)

- **Framework**: Next.js 15 with App Router
- **UI Library**: Tailwind CSS with custom styling
- **State Management**: React hooks with TanStack Query
- **Components**: Modular component architecture
- **TypeScript**: Full type safety

### Backend (Django)

- **Framework**: Django with Django REST Framework
- **LLM Integration**: AWS-hosted LLM via external API
- **API**: RESTful endpoints with OpenAPI documentation
- **CORS**: Configured for frontend communication

## 📁 Project Structure

```
pChat/
├── app/                          # Next.js App Router
│   ├── components/               # Reusable UI components
│   │   ├── ChatContainer.tsx    # Main chat layout
│   │   ├── ChatHeader.tsx       # Header with status
│   │   ├── ChatMessage.tsx      # Individual message
│   │   ├── ChatMessages.tsx     # Messages container
│   │   ├── ChatInput.tsx        # Input field
│   │   ├── LoadingIndicator.tsx # Loading states
│   │   └── index.ts             # Component exports
│   ├── hooks/                   # Custom React hooks
│   │   ├── useChat.hook.ts      # Chat logic and state
│   │   └── usePostPrompt.hook.ts # API integration
│   ├── types/                   # TypeScript interfaces
│   │   └── chat.ts              # Chat-related types
│   ├── schema/                  # API schema
│   │   ├── apiClient.ts         # API client setup
│   │   └── schema.d.ts          # Generated types
│   ├── providers/               # React providers
│   │   └── TanstackQueryClientProvider.tsx
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── src/                         # Django backend
│   ├── aws_llm/                 # LLM integration
│   │   ├── views.py             # API endpoints
│   │   ├── serializers.py       # Data serialization
│   │   ├── urls.py              # URL routing
│   │   └── utils/
│   │       └── llm_wrapper.py   # LLM client
│   ├── main/                    # Main Django app
│   ├── settings/                # Django settings
│   └── manage.py                # Django management
├── docker/                      # Docker configuration
├── package.json                 # Frontend dependencies
├── pyproject.toml              # Backend dependencies
└── README.md                   # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 22+
- Python 3.13+
- pnpm (recommended) or npm

### Frontend Setup

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Start development server**:

   ```bash
   pnpm dev
   ```

3. **Open in browser**: [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. **Create virtual environment**:

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   # or using uv (recommended)
   uv sync
   ```

3. **Run migrations**:

   ```bash
   python manage.py migrate
   ```

4. **Start development server**:

   ```bash
   python manage.py runserver
   ```

5. **API Documentation**: [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)

## 🎨 Design System

### Color Palette

- **Primary Blue**: `#2176FF` - Main accent color
- **Background**: White with subtle gradients
- **Text**: Dark gray/black for readability
- **Accents**: Green for success, red for errors

### Typography

- **Font**: System font stack (San Francisco, Segoe UI, etc.)
- **Weights**: Regular (400), Medium (500), Bold (700)
- **Hierarchy**: Clear text sizing and spacing

### Components

- **Rounded Corners**: 2xl (16px) for modern look
- **Shadows**: Subtle depth and layering
- **Animations**: 300ms smooth transitions
- **Spacing**: Generous padding and margins

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### API Configuration

The backend is configured to work with an external LLM service. Update the LLM endpoint in `src/aws_llm/utils/llm_wrapper.py`:

```python
# Update this URL to your LLM service
LLM_ENDPOINT = "http://your-llm-service:8080/v1/chat/completions"
```

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### Backend (Docker)

1. Build the Docker image:

   ```bash
   docker build -f docker/prod/dockerfile.prod -t pchat-backend .
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose -f docker/prod/docker-compose.prod.yml up -d
   ```

## 📚 API Documentation

### Endpoints

#### POST `/api/aws-llm/chat/`

Send a message to the AI assistant.

**Request Body**:

```json
{
  "message": "Hello, how are you?",
  "model": "gemma2:2b",
  "stream": false
}
```

**Response**:

```json
{
  "response": "Hello! I'm doing well, thank you for asking.",
  "model_used": "gemma2:2b",
  "timestamp": "2024-01-01T12:00:00Z",
  "success": true
}
```

### Interactive API Documentation

Visit [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/) for interactive API documentation.

## 🧪 Development

### Running Tests

```bash
# Frontend tests
pnpm test

# Backend tests
python manage.py test
```

### Code Quality

```bash
# Linting
pnpm lint

# Type checking
pnpm type-check
```

### Building for Production

```bash
# Frontend
pnpm build

# Backend
python manage.py collectstatic
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Django](https://djangoproject.com/) for the robust backend framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [TanStack Query](https://tanstack.com/query) for server state management

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Next.js, Django, and modern web technologies.**
