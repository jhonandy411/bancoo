# Guía de Implementación del Modal Qbank

## 📦 Instalación de Dependencias

Primero necesitas instalar las dependencias necesarias:

```bash
npm install react react-dom @emotion/react @emotion/styled
```

## 🏗️ Estructura de Archivos Creados

1. **QbankModal.jsx** - Componente principal del modal
2. **QbankButton.jsx** - Componente wrapper del botón
3. Esta guía de implementación

## 🔧 Cómo Integrar en tu Proyecto

### Opción 1: Si ya tienes un proyecto React

Simplemente importa y usa el componente `QbankButton`:

```jsx
import QbankButton from './QbankButton';

function Sidebar({ articleTitle }) {
  return (
    <div>
      {/* Tus otros botones */}
      <QbankButton articleTitle={articleTitle} />
    </div>
  );
}
```

### Opción 2: Si estás migrando desde HTML a React

Reemplaza tu botón HTML actual:

```html
<!-- Antes -->
<button class="_4cc9ddf83d96bbf8--secondLevelLink" data-e2e-test-id="qbank-sidebar-option" type="button">
  Qbank
</button>
```

Con el componente React:

```jsx
<QbankButton articleTitle=" " />
```

## 🎨 Características Implementadas

### ✅ Funcionalidades

- **Modal overlay**: Click fuera del modal para cerrarlo
- **Filtros de estado**: 4 checkboxes con estados visuales
  - Not yet answered (gris)
  - Answered correctly using hints (amarillo)
  - Answered incorrectly (rojo)
  - Answered correctly (azul)
- **Slider de preguntas**: Control deslizante con input numérico
- **Botón Refine**: Para refinar filtros (lógica personalizable)
- **Botón Start**: Inicia la sesión (console.log por ahora)

### 🎨 Estilos con Emotion

Los estilos están implementados con:
- `styled-components` de Emotion
- CSS-in-JS con soporte para CSS variables
- Responsive y accesible
- Temas claros/oscuros (usando CSS variables)

## 🔄 Estados Manejados

```jsx
const [filters, setFilters] = useState({
  unseenOrSkipped: true,
  answeredCorrectlyWithHelp: false,
  answeredIncorrectly: false,
  answeredCorrectly: false,
});

const [questionCount, setQuestionCount] = useState(12);
```

## 🎯 Personalización

### Cambiar el número máximo de preguntas

En `QbankModal.jsx`, línea 189:

```jsx
const maxQuestions = 12; // Cambia este valor
```

### Añadir lógica al botón "Start"

En `QbankModal.jsx`, función `handleStart`:

```jsx
const handleStart = () => {
  // Tu lógica aquí
  console.log('Starting session with:', { filters, questionCount });
  
  // Ejemplo: navegar a otra página
  // window.location.href = `/qbank/session?count=${questionCount}`;
  
  onClose();
};
```

### Añadir lógica al botón "Refine"

Añade un handler:

```jsx
const handleRefine = () => {
  // Abre un modal secundario o actualiza filtros
  console.log('Refining filters...');
};
```

Y úsalo en el botón:

```jsx
<Button onClick={handleRefine}>
  {/* ... */}
  Refine
</Button>
```

## 🎨 Personalizar Colores

Los colores usan CSS variables. Puedes sobrescribirlas en tu CSS global:

```css
:root {
  --color-background-primary: #ffffff;
  --color-background-accent: #047a88;
  --color-background-accent-hover: #036572;
  --color-text-primary: #1a1d21;
  --color-text-tertiary: #637589;
  --color-border-primary: #c4ced8;
  --color-border-secondary: #e0e6eb;
  --color-background-secondary: #f5f7f9;
}
```

## 🧪 Testing

Puedes probar el componente importándolo en cualquier componente React:

```jsx
import { useState } from 'react';
import QbankModal from './QbankModal';

function TestPage() {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </button>
      
      <QbankModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        articleTitle="Test Article"
      />
    </div>
  );
}
```

## 📱 Responsive

El modal es responsive por defecto:
- `max-width: 600px` en desktop
- `width: 90%` en móvil
- `max-height: 90vh` con scroll interno

## ♿ Accesibilidad

Características de accesibilidad incluidas:
- `role="dialog"` en el modal
- `aria-label` en botones
- `aria-describedby` para el subtítulo
- Soporte de teclado (ESC para cerrar - necesita añadirse)

### Para añadir cierre con ESC:

Añade en `QbankModal.jsx`:

```jsx
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') onClose();
  };
  
  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }
}, [isOpen, onClose]);
```

## 🚀 Próximos Pasos

1. Integrar con tu API de backend
2. Añadir animaciones de entrada/salida
3. Implementar lógica del botón "Refine"
4. Guardar preferencias del usuario (localStorage)
5. Añadir tests unitarios

## 💡 Consejos

- El modal usa `position: fixed` y `z-index: 9999`
- Los estilos son compatibles con tu CSS existente (clases hasheadas)
- Puedes mezclar componentes React con HTML estático gradualmente

## 🐛 Troubleshooting

### El modal no se ve
- Verifica que `isOpen={true}` esté pasado
- Verifica el `z-index` en tu CSS

### Los estilos no se aplican
- Asegúrate de tener `@emotion/react` y `@emotion/styled` instalados
- Importa el componente correctamente

### Click fuera no cierra el modal
- Verifica que el `onClick` del overlay llame a `onClose`
- Asegúrate de que `stopPropagation` esté en el container interior

---

¿Necesitas ayuda con la implementación? ¡Pregunta! 🚀
