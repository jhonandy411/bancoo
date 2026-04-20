/** @jsxImportSource @emotion/react */
import { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContainer = styled.div`
  background: var(--color-background-primary, #fff);
  border-radius: 8px;
  box-shadow: 0 8px 64px rgba(99, 117, 138, 0.25);
  max-width: 560px;
  width: 100%;
  max-height: 480px;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: var(--color-background-secondary, #f5f7f9);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 2px 0;
  color: var(--color-text-primary, #1a1d21);
  line-height: 1.2;
`;

const Subtitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #647589;
  line-height: 1.4;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.p`
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 2px;
  color: var(--color-text-tertiary, #647589);
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-border-secondary, #e0e6eb);
  margin: 16px 0;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
  cursor: pointer;
`;

const CheckboxBox = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid ${props => {
    if (props.allSelected && props.checked) return 'var(--color-border-primary, #c4ced8)';
    return props.checked ? 'var(--color-background-accent, #047a88)' : 'var(--color-border-primary, #c4ced8)';
  }};
  background: ${props => {
    if (props.allSelected && props.checked) return 'transparent';
    return props.checked ? 'var(--color-background-accent, #047a88)' : 'transparent';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.allSelected && props.checked ? '#637589' : 'white'};
  }
`;

const CheckboxLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  font-size: 16px;
  color: var(--color-text-primary, #1a1d21);
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const SliderContainer = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const Slider = styled.input`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  }
`;

const NumberInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NumberInput = styled.input`
  width: 80px;
  padding: 10px 16px;
  background: transparent !important;
  border: 1px solid var(--color-border-primary, #c4ced8);
  border-radius: 4px;
  text-align: center;
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text-primary, #1a1d21);

  &:focus {
    outline: none;
    border-color: var(--color-background-accent, #047a88);
  }
`;

const Button = styled.button`
  background: ${props => props.variant === 'primary' ? 'var(--color-background-accent, #047a88)' : 'transparent'};
  color: ${props => props.variant === 'primary' ? '#fff' : 'var(--color-text-primary, #1a1d21)'};
  border: none;
  border-radius: 4px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.variant === 'primary' ? 'var(--color-background-accent-hover, #036572)' : 'var(--color-background-secondary, #f5f7f9)'};
  }

  svg {
    width: 16px;
    height: 16px;
  }

  &:focus,
  &:focus-visible {
    outline: none;
  }

  &:disabled {
    background: #b8dade;
    color: #ffffff;
    cursor: not-allowed;
    opacity: 1;
  }

  &:disabled:hover {
    background: #b8dade;
  }
`;

const RefineButton = styled.button`
  background: transparent;
  color: var(--color-text-primary, #1a1d21);
  border: none;
  outline: none;
  box-shadow: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 4px;
  transition: all 0.2s ease;
  letter-spacing: 0.5px;

  &:hover {
    background: var(--color-background-secondary, #f5f7f9);
  }

  &:focus,
  &:focus-visible,
  &:active {
    outline: none;
    box-shadow: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const QbankModal = ({ isOpen, onClose, articleTitle }) => {
  const [filters, setFilters] = useState({
    unseenOrSkipped: true,
    answeredCorrectlyWithHelp: false,
    answeredIncorrectly: false,
    answeredCorrectly: false,
  });

  const [questionCount, setQuestionCount] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(0);
  const [allSelected, setAllSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredIds, setFilteredIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const p = sessionStorage.getItem('currentDocPath');
      const userId = window.firebase?.auth()?.currentUser?.uid;
      
      console.log('🔍 Modal opened. Path:', p, 'UserId:', userId);
      
      if (p && window.db && userId) {
        window.db.collection(`${p}/preguntas`).get().then(async snapshot => {
          const allQuestions = snapshot.docs;
          console.log('📊 Total questions in collection:', allQuestions.length);
          
          // Consultar stats de cada pregunta
          const questionStatsPromises = allQuestions.map(doc => 
            window.db.doc(`users/${userId}/qbankQuestionStats/${doc.id}`).get()
          );
          
          const statsSnapshots = await Promise.all(questionStatsPromises);
          
          // Filtrar preguntas según checkboxes activos
          const filtered = allQuestions.filter((doc, index) => {
            const statDoc = statsSnapshots[index];
            const exists = statDoc.exists;
            const statData = exists ? statDoc.data() : {};
            
            const isAnswered = exists;
            const isCorrect = statData.isCorrect === "true" || statData.isCorrect === "true2";
            const isCorrectWithHints = statData.isCorrect === "true2";
            const isSkipped = statData.lastChoice === "skip" || statData.isCorrect === "skipped" || statData.userChoice === "skip";
            
            console.log(`Question ${doc.id}: answered=${isAnswered}, correct=${isCorrect}, hints=${isCorrectWithHints}, skipped=${isSkipped}`, statData);
            
            // Not yet answered OR Skipped
            if (filters.unseenOrSkipped && (!isAnswered || isSkipped)) return true;
            
            // Answered correctly using hints
            if (filters.answeredCorrectlyWithHelp && isCorrectWithHints) return true;
            
            // Answered incorrectly
            if (filters.answeredIncorrectly && isAnswered && statData.isCorrect === "false") return true;
            
            // Answered correctly (without hints)
            if (filters.answeredCorrectly && statData.isCorrect === "true") return true;
            
            return false;
          });
          
          console.log('✅ Filtered questions:', filtered.length, 'Active filters:', filters);
          const ids = filtered.map(d => d.id);
          setFilteredIds(ids);
          setMaxQuestions(filtered.length);
          setQuestionCount(filtered.length);
          setIsLoading(false);
        });
      }
    }
  }, [isOpen, filters]);

  const handleCheckboxChange = (key) => {
    // Si estamos en modo allSelected, solo marcar el clickeado
    if (allSelected) {
      setFilters({
        unseenOrSkipped: key === 'unseenOrSkipped',
        answeredCorrectlyWithHelp: key === 'answeredCorrectlyWithHelp',
        answeredIncorrectly: key === 'answeredIncorrectly',
        answeredCorrectly: key === 'answeredCorrectly',
      });
      setAllSelected(false);
      return;
    }
    
    const newFilters = { ...filters, [key]: !filters[key] };
    
    // Verificar si todos están deseleccionados
    const allUnchecked = !newFilters.unseenOrSkipped && 
                         !newFilters.answeredCorrectlyWithHelp && 
                         !newFilters.answeredIncorrectly && 
                         !newFilters.answeredCorrectly;
    
    // Si todos están deseleccionados, marcar todos
    if (allUnchecked) {
      setFilters({
        unseenOrSkipped: true,
        answeredCorrectlyWithHelp: true,
        answeredIncorrectly: true,
        answeredCorrectly: true,
      });
      setAllSelected(true);
    } else {
      setFilters(newFilters);
      setAllSelected(false);
    }
  };


  const handleSliderChange = (e) => {
    setQuestionCount(parseInt(e.target.value));
  };

  const handleInputChange = (e) => {
    const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), maxQuestions);
    setQuestionCount(value);
  };

  const handleStart = () => {
    console.log('Starting session with:', { filters, questionCount });
    
    // Clear analysis review flag if present
    sessionStorage.removeItem('isFromAnalysis');
    
    // Save limit and filtered IDs
    sessionStorage.setItem('qbankSessionLimit', questionCount);
    sessionStorage.setItem('qbankFilteredIds', JSON.stringify(filteredIds));

    // Load qbank session with correct sidebar
    if (typeof window.loadQbankSession === 'function') {
      window.loadQbankSession();
    } else if (typeof window.loadMainContent === 'function') {
      window.loadMainContent('qbanksesion.html');
    } else {
      // Fallback if loadMainContent is not available
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        fetch('qbanksesion.html')
          .then(response => response.text())
          .then(html => {
            mainContent.innerHTML = html;
          })
          .catch(err => console.error('Error loading qbank session:', err));
      }
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div>
            <Title>Create Question Session Based On</Title>
            <Subtitle>{articleTitle || ''}</Subtitle>
          </div>
          <CloseButton onClick={onClose} aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <g fill="currentColor">
                <path d="M12.707 4.707a1 1 0 0 0-1.414-1.414zm-9.414 6.586a1 1 0 1 0 1.414 1.414zm8-8-8 8 1.414 1.414 8-8z" />
                <path d="M4.707 3.293a1 1 0 0 0-1.414 1.414zm6.586 9.414a1 1 0 0 0 1.414-1.414zm-8-8 8 8 1.414-1.414-8-8z" />
              </g>
            </svg>
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <Divider />

          <Section>
            <SectionTitle>STATUS</SectionTitle>
            
            <CheckboxContainer onClick={() => handleCheckboxChange('unseenOrSkipped')}>
              <CheckboxBox checked={filters.unseenOrSkipped} allSelected={allSelected}>
                {filters.unseenOrSkipped && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14 4-8.25 8L2 8.364" />
                  </svg>
                )}
              </CheckboxBox>
              <CheckboxLabel>
                <StatusDot color="#637589" />
                <span>Not yet answered</span>
              </CheckboxLabel>
            </CheckboxContainer>

            <CheckboxContainer onClick={() => handleCheckboxChange('answeredCorrectlyWithHelp')}>
              <CheckboxBox checked={filters.answeredCorrectlyWithHelp} allSelected={allSelected}>
                {filters.answeredCorrectlyWithHelp && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14 4-8.25 8L2 8.364" />
                  </svg>
                )}
              </CheckboxBox>
              <CheckboxLabel>
                <StatusDot color="#f5a623" />
                <span>Answered correctly using hints</span>
              </CheckboxLabel>
            </CheckboxContainer>

            <CheckboxContainer onClick={() => handleCheckboxChange('answeredIncorrectly')}>
              <CheckboxBox checked={filters.answeredIncorrectly} allSelected={allSelected}>
                {filters.answeredIncorrectly && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14 4-8.25 8L2 8.364" />
                  </svg>
                )}
              </CheckboxBox>
              <CheckboxLabel>
                <StatusDot color="#f17d7c" />
                <span>Answered incorrectly</span>
              </CheckboxLabel>
            </CheckboxContainer>

            <CheckboxContainer onClick={() => handleCheckboxChange('answeredCorrectly')}>
              <CheckboxBox checked={filters.answeredCorrectly} allSelected={allSelected}>
                {filters.answeredCorrectly && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14 4-8.25 8L2 8.364" />
                  </svg>
                )}
              </CheckboxBox>
              <CheckboxLabel>
                <StatusDot color="#047a88" />
                <span>Answered correctly</span>
              </CheckboxLabel>
            </CheckboxContainer>
          </Section>

          <Divider />

          <Section>
            <SectionTitle>QUESTION COUNT</SectionTitle>
            <SliderContainer>
              <Slider
                type="range"
                min="0"
                max={maxQuestions}
                value={questionCount}
                onChange={handleSliderChange}
                style={{
                  background: `linear-gradient(to right, var(--color-background-accent, #047a88) 0%, var(--color-background-accent, #047a88) ${(questionCount/maxQuestions)*100}%, var(--color-divider-primary, #e0e6eb) ${(questionCount/maxQuestions)*100}%, var(--color-divider-primary, #e0e6eb) 100%)`
                }}
              />
              <NumberInputContainer>
                <NumberInput
                  type="number"
                  min="0"
                  max={maxQuestions}
                  value={questionCount}
                  onChange={handleInputChange}
                />
                <span style={{ fontSize: '16px', color: 'var(--color-text-tertiary, #637589)' }}>/ {maxQuestions}</span>
              </NumberInputContainer>
              <RefineButton>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path fill="currentColor" fillRule="evenodd" d="M.452 1.528A1 1 0 0 1 1.333 1h13.334a1 1 0 0 1 .832 1.555l-4.706 6.748V15a1 1 0 0 1-1.351.936l-4-1.5a1 1 0 0 1-.65-.936V9.303L.503 2.555a1 1 0 0 1-.05-1.027ZM3.202 3l3.423 5.445A1 1 0 0 1 6.793 9v3.807l2 .75V9a1 1 0 0 1 .168-.555L12.798 3z" clipRule="evenodd" />
                </svg>
                REFINE
              </RefineButton>
            </SliderContainer>
          </Section>

          <Divider />

          <Button variant="primary" fullWidth onClick={handleStart} disabled={isLoading || questionCount === 0}>
            {isLoading ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{animation: 'spin 0.95s linear infinite'}}>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <g stroke="#047a88" strokeWidth="3.2" strokeLinecap="round">
                  <line x1="12" y1="1.5" x2="12" y2="6" />
                  <line x1="12" y1="1.5" x2="12" y2="6" transform="rotate(45 12 12)" />
                  <line x1="12" y1="1.5" x2="12" y2="6" transform="rotate(90 12 12)" />
                  <line x1="12" y1="1.5" x2="12" y2="6" transform="rotate(135 12 12)" />
                  <line x1="12" y1="1.5" x2="12" y2="6" transform="rotate(180 12 12)" />
                  <line x1="12" y1="1.5" x2="12" y2="6" transform="rotate(225 12 12)" />
                  <line x1="12" y1="1.5" x2="12" y2="6" transform="rotate(270 12 12)" />
                  <line x1="12" y1="1.5" x2="12" y2="6" transform="rotate(315 12 12)" />
                </g>
              </svg>
            ) : 'Start'}
          </Button>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default QbankModal;
