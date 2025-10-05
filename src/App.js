import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styled, { css, keyframes } from "styled-components";
import 'chart.js/auto';

/* Utility helpers */
const clone = (o) => JSON.parse(JSON.stringify(o));
const formatOvers = (balls) => `${Math.floor(balls / 6)}.${balls % 6}`;

// Responsive breakpoints
const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px'
};

// Media query helper
const media = {
  mobile: (styles) => css`@media (max-width: ${breakpoints.mobile}) { ${styles} }`,
  tablet: (styles) => css`@media (max-width: ${breakpoints.tablet}) { ${styles} }`,
  desktop: (styles) => css`@media (min-width: ${breakpoints.desktop}) { ${styles} }`
};

// Animation for ball delivery
const ballAnimation = keyframes`
  0% { transform: translateX(0) rotate(0deg); }
  50% { transform: translateX(100px) rotate(180deg); }
  100% { transform: translateX(0) rotate(360deg); }
`;

// Animation for milestone highlight
const milestoneAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

// Styled Components with Cricket Theme (No Blue) and Full Responsiveness
const AppContainer = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  background-color: ${props => props.darkMode ? '#1a1a1a' : '#f8f9fa'};
  min-height: 100vh;
  transition: all 0.3s ease;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #2d5016, #4a7c28);
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  ${media.desktop(css`
    padding: 1rem 2rem;
  `)}
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${media.desktop(css`
    font-size: 1.8rem;
  `)}
`;

const DarkModeToggle = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MainContent = styled.main`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  
  ${media.desktop(css`
    padding: 2rem;
  `)}
`;

const Card = styled.div`
  background: ${props => props.darkMode ? '#2a2a2a' : 'white'};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  
  ${media.desktop(css`
    padding: 2rem;
  `)}
`;

const CardTitle = styled.h2`
  margin-top: 0;
  color: ${props => props.darkMode ? '#4a7c28' : '#2d5016'};
  border-bottom: 2px solid ${props => props.darkMode ? '#444' : '#eaeaea'};
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  
  ${media.desktop(css`
    font-size: 1.5rem;
  `)}
`;

const Button = styled.button`
  background: ${props => props.primary ? '#4a7c28' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  margin: 0.25rem;
  font-size: 0.9rem;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${media.desktop(css`
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
  `)}
  
  &:hover {
    background: ${props => props.primary ? '#5a8c38' : '#5a6268'};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${props => props.darkMode ? '#555' : '#ced4da'};
  border-radius: 4px;
  width: 100%;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  min-height: 44px;
  background-color: ${props => props.darkMode ? '#333' : 'white'};
  color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  transition: border-color 0.2s;
  box-sizing: border-box;
  text-transform: uppercase;
  
  &:focus {
    outline: none;
    border-color: #4a7c28;
    box-shadow: 0 0 0 2px rgba(74, 124, 40, 0.25);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.darkMode ? '#555' : '#ced4da'};
  border-radius: 4px;
  width: 100%;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  min-height: 44px;
  background-color: ${props => props.darkMode ? '#333' : 'white'};
  color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  transition: border-color 0.2s;
  box-sizing: border-box;
  text-transform: uppercase;
  
  &:focus {
    outline: none;
    border-color: #4a7c28;
    box-shadow: 0 0 0 2px rgba(74, 124, 40, 0.25);
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  
  ${media.mobile(css`
    flex-direction: column;
    gap: 0.75rem;
  `)}
`;

const FormColumn = styled.div`
  flex: 1;
  min-width: 200px;
  
  ${media.mobile(css`
    min-width: 100%;
  `)}
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: 1rem;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  min-width: 600px;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${props => props.darkMode ? '#444' : '#dee2e6'};
    font-size: 0.9rem;
    
    ${media.mobile(css`
      padding: 0.5rem;
      font-size: 0.8rem;
    `)}
  }
  
  th {
    background-color: ${props => props.darkMode ? '#333' : '#f8f9fa'};
    font-weight: 600;
    color: ${props => props.darkMode ? '#e0e0e0' : '#495057'};
    font-size: 0.95rem;
    
    ${media.mobile(css`
      font-size: 0.85rem;
    `)}
  }
  
  tr:nth-child(even) {
    background-color: ${props => props.darkMode ? '#2a2a2a' : '#f8f9fa'};
  }
  
  tr:hover {
    background-color: ${props => props.darkMode ? '#333' : '#e9ecef'};
  }
`;

const ScoreDisplay = styled.div`
  background: linear-gradient(135deg, #2d5016, #4a7c28);
  color: white;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  
  ${media.mobile(css`
    padding: 1rem;
  `)}
`;

const ScoreMain = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  animation: ${props => props.highlight ? milestoneAnimation : 'none'} 1s ease-in-out;
  
  ${media.desktop(css`
    font-size: 3rem;
  `)}
  
  ${media.mobile(css`
    font-size: 2rem;
  `)}
`;

const ScoreDetails = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  margin: 0.5rem 0;
  
  ${media.desktop(css`
    font-size: 1.2rem;
  `)}
`;

const RunRateDisplay = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  
  ${media.mobile(css`
    flex-direction: column;
    gap: 0.5rem;
  `)}
`;

const RunRateItem = styled.div`
  text-align: center;
  padding: 0.5rem;
`;

const RunRateLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
`;

const RunRateValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${props => props.darkMode ? '#2a2a2a' : 'white'};
  border-radius: 8px;
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  
  ${media.mobile(css`
    padding: 1rem;
    max-width: 95%;
  `)}
  
  ${media.desktop(css`
    padding: 2rem;
    width: 90%;
  `)}
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${props => props.darkMode ? '#4a7c28' : '#2d5016'};
  font-size: 1.2rem;
  
  ${media.desktop(css`
    font-size: 1.4rem;
  `)}
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.darkMode ? '#e0e0e0' : '#6c757d'};
  min-height: 44px;
  min-width: 44px;
  
  &:hover {
    color: ${props => props.darkMode ? '#fff' : '#343a40'};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
  
  ${media.mobile(css`
    justify-content: center;
  `)}
`;

const RunButton = styled(Button)`
  background: ${props => {
    switch(props.run) {
      case 0: return '#6c757d';
      case 1: return '#28a745';
      case 2: return '#17a2b8';
      case 3: return '#ffc107';
      case 4: return '#fd7e14';
      case 6: return '#dc3545';
      default: return '#6c757d';
    }
  }};
  
  min-width: 50px;
  font-weight: bold;
  flex: 1;
  animation: ${props => props.animate ? ballAnimation : 'none'} 1s ease-in-out;
  
  ${media.desktop(css`
    flex: none;
  `)}
`;

const WicketButton = styled(Button)`
  background: #dc3545;
  flex: 1;
  
  ${media.desktop(css`
    flex: none;
  `)}
`;

const ExtrasButton = styled(Button)`
  background: #6f42c1;
  flex: 1;
  
  ${media.desktop(css`
    flex: none;
  `)}
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 4px;
  background: ${props => {
    switch(props.status) {
      case 'batting': return '#28a745';
      case 'out': return '#dc3545';
      case 'retired': return '#ffc107';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const CurrentPlayer = styled.tr`
  background-color: ${props => props.darkMode ? '#333' : '#e7f3ff'} !important;
`;

const TeamInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  ${media.mobile(css`
    flex-direction: column;
    align-items: flex-start;
  `)}
`;

const MatchInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: ${props => props.darkMode ? '#aaa' : '#6c757d'};
  
  ${media.mobile(css`
    font-size: 0.8rem;
  `)}
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Team logo display
const TeamLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.5rem;
  
  ${media.mobile(css`
    width: 30px;
    height: 30px;
  `)}
`;

const TeamNameWithLogo = styled.div`
  display: flex;
  align-items: center;
`;

// Initial Players Display Component
const InitialPlayersDisplay = styled.div`
  background: ${props => props.darkMode ? '#2a2a2a' : '#f0f8e8'};
  border: 1px solid ${props => props.darkMode ? '#444' : '#d4e8c4'};
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  ${media.mobile(css`
    flex-direction: column;
    gap: 0.5rem;
  `)}
`;

const PlayerRole = styled.div`
  text-align: center;
  flex: 1;
  min-width: 100px;
  
  .role-label {
    font-size: 0.8rem;
    color: ${props => props.darkMode ? '#aaa' : '#4a7c28'};
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  .player-name {
    font-size: 1rem;
    font-weight: 500;
    color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
  }
`;

// Enhanced Wicket Modal
const WicketModal = styled(ModalContent)`
  border-top: 5px solid #dc3545;
`;

const WicketHeader = styled.div`
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  padding: 1rem;
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  border-radius: 8px 8px 0 0;
  text-align: center;
  
  ${media.desktop(css`
    margin: -2rem -2rem 1.5rem -2rem;
    padding: 1rem;
  `)}
`;

const WicketFormSection = styled.div`
  background: ${props => props.darkMode ? '#333' : '#fff5f5'};
  border: 1px solid ${props => props.darkMode ? '#555' : '#f8d7da'};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const WicketSectionTitle = styled.h4`
  color: ${props => props.darkMode ? '#e0e0e0' : '#721c24'};
  margin-top: 0;
  margin-bottom: 0.75rem;
  font-size: 1rem;
`;

const WicketButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const WicketSubmitButton = styled(Button)`
  background: #dc3545;
  flex: 1;
  
  ${media.desktop(css`
    flex: none;
  `)}
  
  &:hover {
    background: #c82333;
  }
`;

const WicketCancelButton = styled(Button)`
  background: #6c757d;
  flex: 1;
  
  ${media.desktop(css`
    flex: none;
  `)}
  
  &:hover {
    background: #5a6268;
  }
`;

// Mobile-optimized scorecard
const MobileScorecard = styled.div`
  ${media.mobile(css`
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `)}
`;

const MobileCard = styled(Card)`
  ${media.mobile(css`
    margin-bottom: 1rem;
  `)}
`;

// Partnership display
const PartnershipDisplay = styled.div`
  background: ${props => props.darkMode ? '#2a2a2a' : '#f8f9fa'};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #4a7c28;
`;

const PartnershipTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: ${props => props.darkMode ? '#e0e0e0' : '#333'};
`;

const PartnershipDetails = styled.div`
  display: flex;
  justify-content: space-between;
  
  ${media.mobile(css`
    flex-direction: column;
    gap: 0.25rem;
  `)}
`;

// Milestone notification
const MilestoneNotification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #4a7c28, #2d5016);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  animation: ${milestoneAnimation} 1s ease-in-out;
  max-width: 300px;
  
  ${media.mobile(css`
    max-width: 250px;
    right: 10px;
    top: 10px;
  `)}
`;

// Bowler selection modal
const BowlerSelectionModal = styled(ModalContent)`
  border-top: 5px solid #4a7c28;
`;

const BowlerSelectionHeader = styled.div`
  background: linear-gradient(135deg, #4a7c28, #2d5016);
  color: white;
  padding: 1rem;
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  border-radius: 8px 8px 0 0;
  text-align: center;
  
  ${media.desktop(css`
    margin: -2rem -2rem 1.5rem -2rem;
    padding: 1rem;
  `)}
`;

const BowlerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const BowlerOption = styled.div`
  padding: 0.75rem;
  border: 1px solid ${props => props.darkMode ? '#555' : '#ced4da'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.darkMode ? '#333' : '#f8f9fa'};
  }
  
  ${props => props.selected && css`
    background-color: #4a7c28;
    color: white;
    border-color: #4a7c28;
  `}
`;

// Manual runs modal
const ManualRunsModal = styled(ModalContent)`
  border-top: 5px solid #17a2b8;
`;

const ManualRunsHeader = styled.div`
  background: linear-gradient(135deg, #17a2b8, #117a8b);
  color: white;
  padding: 1rem;
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  border-radius: 8px 8px 0 0;
  text-align: center;
  
  ${media.desktop(css`
    margin: -2rem -2rem 1.5rem -2rem;
    padding: 1rem;
  `)}
`;

// File upload for team logos
const FileUpload = styled.div`
  position: relative;
  display: inline-block;
  cursor: pointer;
  width: 100%;
`;

const FileUploadInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const FileUploadLabel = styled.label`
  display: block;
  padding: 0.75rem;
  border: 1px dashed ${props => props.darkMode ? '#555' : '#ced4da'};
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.darkMode ? '#333' : '#f8f9fa'};
  }
`;

const TeamSetupContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  ${media.mobile(css`
    flex-direction: column;
    gap: 0.75rem;
  `)}
`;

const TeamLogoContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.darkMode ? '#333' : '#f0f0f0'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  ${media.mobile(css`
    width: 50px;
    height: 50px;
  `)}
`;

const TeamLogoPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TeamDetails = styled.div`
  flex: 1;
`;

// Required runs display
const RequiredRunsDisplay = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  display: inline-block;
  
  ${media.mobile(css`
    font-size: 1rem;
    padding: 0.4rem 0.8rem;
  `)}
`;

// Extras breakdown display
const ExtrasBreakdown = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  justify-content: center;
  
  ${media.mobile(css`
    justify-content: flex-start;
  `)}
`;

const ExtraItem = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
`;

// Over details table
const OverDetailsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 0.5rem;
    text-align: center;
    border: 1px solid ${props => props.darkMode ? '#444' : '#dee2e6'};
    font-size: 0.9rem;
    
    ${media.mobile(css`
      padding: 0.4rem;
      font-size: 0.8rem;
    `)}
  }
  
  th {
    background-color: ${props => props.darkMode ? '#333' : '#f8f9fa'};
    font-weight: 600;
    color: ${props => props.darkMode ? '#e0e0e0' : '#495057'};
  }
  
  .ball-cell {
    width: auto;
  }
  
  .runs-cell {
    font-weight: bold;
  }
`;

export default function App() {
  // All the existing state variables remain the same
  const [page, setPage] = useState("login");
  const [phone, setPhone] = useState("");
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);
  
  // Team logos
  const [team1Logo, setTeam1Logo] = useState("");
  const [team2Logo, setTeam2Logo] = useState("");
  
  // Animation states
  const [animateBall, setAnimateBall] = useState(false);
  const [highlightMilestone, setHighlightMilestone] = useState(false);
  const [milestoneNotification, setMilestoneNotification] = useState(null);
  
  // Partnership tracking
  const [currentPartnership, setCurrentPartnership] = useState({
    batsman1: "",
    batsman2: "",
    runs: 0,
    balls: 0,
    startOver: 0,
    startBall: 0
  });
  
  // Run rate tracking
  const [currentRunRate, setCurrentRunRate] = useState(0);
  const [requiredRunRate, setRequiredRunRate] = useState(0);
  
  // Over details tracking
  // -> now dynamic: stores every delivery (legal and extras) in order for the current over
  const [currentOverBalls, setCurrentOverBalls] = useState([]); // each item: { text, legal }
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  
  // Bowler selection modal
  const [bowlerSelectionOpen, setBowlerSelectionOpen] = useState(false);
  const [savedBowlers, setSavedBowlers] = useState([]);
  const [newBowlerName, setNewBowlerName] = useState("");
  
  // Manual runs modal
  const [manualRunsOpen, setManualRunsOpen] = useState(false);
  const [manualRunsValue, setManualRunsValue] = useState("");
  
  // Player squads
  const [team1Squad, setTeam1Squad] = useState([]);
  const [team2Squad, setTeam2Squad] = useState([]);
  const [squadModalOpen, setSquadModalOpen] = useState(false);
  const [currentSquadTeam, setCurrentSquadTeam] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");

  // setup fields
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");
  const [oversLimit, setOversLimit] = useState("");
  const [ground, setGround] = useState("");
  const [date, setDate] = useState("");
  const [setupStriker, setSetupStriker] = useState("");
  const [setupNonStriker, setSetupNonStriker] = useState("");
  const [setupBowler, setSetupBowler] = useState("");

  // match state
  const [totalRuns, setTotalRuns] = useState(0);
  const [totalWickets, setTotalWickets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [batsmen, setBatsmen] = useState({});
  const [bowlerStats, setBowlerStats] = useState({});
  const [striker, setStriker] = useState("");
  const [nonStriker, setNonStriker] = useState("");
  const [currentBowler, setCurrentBowler] = useState("");
  const [history, setHistory] = useState([]);
  const [oversLimitNum, setOversLimitNum] = useState(null);

  // innings & teams
  const [innings, setInnings] = useState(1);
  const [battingTeam, setBattingTeam] = useState("");
  const [firstInningsScore, setFirstInningsScore] = useState(null);
  const [target, setTarget] = useState(null);

  // store full innings details for final summary
  const [firstInningsDetail, setFirstInningsDetail] = useState(null);
  const [secondInningsDetail, setSecondInningsDetail] = useState(null);
  const [finalModalOpen, setFinalModalOpen] = useState(false);

  // extras breakdown
  const [extrasBreakdown, setExtrasBreakdown] = useState({
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
    negative: 0
  });

  // wicket panel
  const [wicketPanelOpen, setWicketPanelOpen] = useState(false);
  const [wicketForm, setWicketForm] = useState({
    outName: "",
    method: "Bowled",
    helper: "",
    newBatsman: "",
    isRunOut: false,
    runOutWhichBatter: "Striker",
    runOutEnd: "Striker End",
    runsBefore: 0,
  });

  // second innings start modal
  const [startSecondOpen, setStartSecondOpen] = useState(false);
  const [secondStriker, setSecondStriker] = useState("");
  const [secondNonStriker, setSecondNonStriker] = useState("");
  const [secondBowler, setSecondBowler] = useState("");

  // Handle team logo upload
  const handleTeamLogoUpload = (team, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (team === 1) {
          setTeam1Logo(reader.result);
        } else {
          setTeam2Logo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  // Check for saved dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  // Check for milestones
  const checkMilestone = (runs, wickets) => {
    // Check for batting milestones
    if (batsmen[striker]) {
      const batsmanRuns = batsmen[striker].runs;
      if (batsmanRuns === 50 || batsmanRuns === 100) {
        setMilestoneNotification({
          type: 'batting',
          player: striker,
          milestone: batsmanRuns === 50 ? 'Half Century' : 'Century',
          runs: batsmanRuns
        });
        setHighlightMilestone(true);
        setTimeout(() => setHighlightMilestone(false), 1000);
        setTimeout(() => setMilestoneNotification(null), 3000);
      }
    }
    
    // Check for bowling milestones
    if (bowlerStats[currentBowler]) {
      const bowlerWickets = bowlerStats[currentBowler].wickets;
      if (bowlerWickets === 5) {
        setMilestoneNotification({
          type: 'bowling',
          player: currentBowler,
          milestone: 'Five Wicket Haul',
          wickets: bowlerWickets
        });
        setHighlightMilestone(true);
        setTimeout(() => setHighlightMilestone(false), 1000);
        setTimeout(() => setMilestoneNotification(null), 3000);
      }
    }
  };

  // Calculate current run rate
  const calculateRunRate = (runs, balls) => {
    if (balls === 0) return 0;
    return (runs / (balls / 6)).toFixed(2);
  };

  // Calculate required run rate for second innings - FIXED
  const calculateRequiredRunRate = () => {
    if (innings !== 2 || !target || !oversLimitNum) return 0;
    const runsNeeded = target - totalRuns;
    const ballsRemaining = oversLimitNum * 6 - balls;
    const oversRemaining = ballsRemaining / 6;
    if (oversRemaining <= 0) return 0;
    return (runsNeeded / oversRemaining).toFixed(2);
  };

  // Calculate required runs and balls remaining
  const calculateRequiredRunsAndBalls = () => {
    if (innings !== 2 || !target || !oversLimitNum) return { runs: 0, balls: 0 };
    const runsNeeded = target - totalRuns;
    const ballsRemaining = oversLimitNum * 6 - balls;
    return { runs: runsNeeded, balls: ballsRemaining };
  };

  // Update partnership
  const updatePartnership = () => {
    if (!striker || !nonStriker) return;
    
    // Check if partnership needs to be reset
    if (currentPartnership.batsman1 !== striker || currentPartnership.batsman2 !== nonStriker) {
      // Calculate previous partnership stats
      const prevRuns = currentPartnership.runs;
      const prevBalls = currentPartnership.balls;
      
      // Reset partnership
      setCurrentPartnership({
        batsman1: striker,
        batsman2: nonStriker,
        runs: 0,
        balls: 0,
        startOver: Math.floor(balls / 6),
        startBall: balls % 6
      });
      
      // Store previous partnership if it had runs
      if (prevRuns > 0) {
        // You could store this in a partnerships array if needed
      }
    }
  };

  // Add bowler to saved list
  const addBowler = () => {
    if (newBowlerName.trim() && !savedBowlers.includes(newBowlerName.trim())) {
      setSavedBowlers([...savedBowlers, newBowlerName.trim()]);
      setNewBowlerName("");
    }
  };

  // Select bowler from saved list
  const selectBowler = (bowlerName) => {
    setCurrentBowler(bowlerName);
    setBowlerSelectionOpen(false);
  };

  // Add player to squad
  const addPlayerToSquad = () => {
    if (newPlayerName.trim()) {
      if (currentSquadTeam === 1) {
        setTeam1Squad([...team1Squad, newPlayerName.trim()]);
      } else {
        setTeam2Squad([...team2Squad, newPlayerName.trim()]);
      }
      setNewPlayerName("");
    }
  };

  // Open squad modal for specific team
  const openSquadModal = (team) => {
    setCurrentSquadTeam(team);
    setSquadModalOpen(true);
  };

  // Select player from squad
  const selectPlayerFromSquad = (playerName, role) => {
    if (role === 'striker') {
      setSetupStriker(playerName);
    } else if (role === 'nonStriker') {
      setSetupNonStriker(playerName);
    } else if (role === 'bowler') {
      setSetupBowler(playerName);
    }
    setSquadModalOpen(false);
  };

  // Record delivery with animation
  const recordDeliveryWithAnimation = (deliveryData) => {
    setAnimateBall(true);
    recordDelivery(deliveryData);
    setTimeout(() => setAnimateBall(false), 1000);
  };

  const pushSnapshot = () => {
    const snap = {
      totalRuns,
      totalWickets,
      balls,
      batsmen: clone(batsmen),
      bowlerStats: clone(bowlerStats),
      striker,
      nonStriker,
      currentBowler,
      oversLimitNum,
      extras: Object.values(extrasBreakdown).reduce((sum, val) => sum + val, 0),
      extrasBreakdown: clone(extrasBreakdown),
      innings,
      battingTeam,
      firstInningsScore,
      target,
      currentOverBalls: [...currentOverBalls],
      deliveryHistory: [...deliveryHistory]
    };
    setHistory((h) => [...h, snap]);
  };

  const restoreSnapshot = (snap) => {
    setTotalRuns(snap.totalRuns);
    setTotalWickets(snap.totalWickets);
    setBalls(snap.balls);
    setBatsmen(snap.batsmen);
    setBowlerStats(snap.bowlerStats);
    setStriker(snap.striker);
    setNonStriker(snap.nonStriker);
    setCurrentBowler(snap.currentBowler);
    setOversLimitNum(snap.oversLimitNum);
    setExtrasBreakdown(snap.extrasBreakdown || {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      negative: 0
    });
    setInnings(snap.innings || 1);
    setBattingTeam(snap.battingTeam || "");
    setFirstInningsScore(snap.firstInningsScore || null);
    setTarget(snap.target || null);
    setCurrentOverBalls(snap.currentOverBalls || []);
    setDeliveryHistory(snap.deliveryHistory || []);
  };

  const ensureBatsman = (name, copy) => {
    if (!name) return;
    if (!copy[name]) {
      copy[name] = { name, runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting" };
    }
  };

  const ensureBowler = (name, copy) => {
    if (!name) return;
    if (!copy[name]) {
      copy[name] = { balls: 0, runs: 0, wickets: 0 };
    }
  };

  const startMatch = () => {
    if (!team1 || !team2) {
      alert("Enter both team names");
      return;
    }
    if (!setupStriker || !setupNonStriker || !setupBowler) {
      alert("Enter striker, non-striker and bowler names");
      return;
    }

    // determine batting team using tossWinner + decision if available
    let firstBatting = team1;
    if (tossWinner && decision) {
      if (decision === "Batting") firstBatting = tossWinner;
      else {
        // bowling chosen by toss winner -> other team bats
        firstBatting = tossWinner === team1 ? team2 : team1;
      }
    }

    const initialB = {};
    initialB[setupStriker] = { name: setupStriker, runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting" };
    initialB[setupNonStriker] = { name: setupNonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting" };
    const initialBow = {};
    initialBow[setupBowler] = { balls: 0, runs: 0, wickets: 0 };

    setBatsmen(initialB);
    setBowlerStats(initialBow);
    setStriker(setupStriker);
    setNonStriker(setupNonStriker);
    setCurrentBowler(setupBowler);
    setTotalRuns(0);
    setTotalWickets(0);
    setBalls(0);
    setHistory([]);
    setExtrasBreakdown({
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      negative: 0
    });
    setOversLimitNum(oversLimit ? parseInt(oversLimit, 10) : null);
    setInnings(1);
    setBattingTeam(firstBatting);
    setFirstInningsScore(null);
    setTarget(null);
    setFirstInningsDetail(null);
    setSecondInningsDetail(null);
    setFinalModalOpen(false);
    
    // Initialize partnership
    setCurrentPartnership({
      batsman1: setupStriker,
      batsman2: setupNonStriker,
      runs: 0,
      balls: 0,
      startOver: 0,
      startBall: 0
    });
    
    // Reset over balls
    setCurrentOverBalls([]);
    setDeliveryHistory([]);
    
    // Add current bowler to saved list if not already there
    if (setupBowler && !savedBowlers.includes(setupBowler)) {
      setSavedBowlers([...savedBowlers, setupBowler]);
    }
    
    setPage("match");
  };

  const openStartSecondModal = (firstSnapshot) => {
    // save the first innings snapshot detail for final summary
    setFirstInningsDetail(firstSnapshot);

    // clear previous innings' bowler list so 1st innings bowlers don't show
    setBowlerStats({});
    setCurrentBowler("");
    setSecondStriker("");
    setSecondNonStriker("");
    setSecondBowler("");
    setStartSecondOpen(true);
  };

  const startSecondInnings = () => {
    if (!secondStriker || !secondNonStriker || !secondBowler) {
      alert("Enter striker, non-striker, and bowler for second innings.");
      return;
    }

    // set batting team to other team
    const other = battingTeam === team1 ? team2 : team1;

    // reset relevant match state to start chase
    const b = {};
    b[secondStriker] = { name: secondStriker, runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting" };
    b[secondNonStriker] = { name: secondNonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting" };
    setBatsmen(b);

    // Important: initialize bowler stats only with second innings bowler(s)
    const secondBowObj = {};
    secondBowObj[secondBowler] = { balls: 0, runs: 0, wickets: 0 };
    setBowlerStats(secondBowObj);

    setStriker(secondStriker);
    setNonStriker(secondNonStriker);
    setCurrentBowler(secondBowler);

    setTotalRuns(0);
    setTotalWickets(0);
    setBalls(0);
    setHistory([]);
    setExtrasBreakdown({
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0,
      negative: 0
    });
    setOversLimitNum(oversLimit ? parseInt(oversLimit, 10) : null);
    setBattingTeam(other);
    setInnings(2);
    setStartSecondOpen(false);
    
    // Reset partnership
    setCurrentPartnership({
      batsman1: secondStriker,
      batsman2: secondNonStriker,
      runs: 0,
      balls: 0,
      startOver: 0,
      startBall: 0
    });
    
    // Reset over balls
    setCurrentOverBalls([]);
    setDeliveryHistory([]);
    
    // Add current bowler to saved list if not already there
    if (secondBowler && !savedBowlers.includes(secondBowler)) {
      setSavedBowlers([...savedBowlers, secondBowler]);
    }
  };

  const openFinalSummary = (secondSnapshot, resultText) => {
    setSecondInningsDetail({ ...secondSnapshot, resultText, firstInningsDetail });
    setFinalModalOpen(true);
  };

  const downloadFinalPDFAndExit = () => {
    const element = document.getElementById("final-scorecard");
    if (!element) {
      alert("Final scorecard element not found. Make sure the final modal is open.");
      return;
    }

    html2canvas(element)
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        // sanitize team names for filename
        const safe = (s) =>
          (s || "")
            .toString()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_-]/g, "") || "Team";

        const fileName = `${safe(team1)}_vs_${safe(team2)}_FinalScorecard.pdf`;
        try {
          pdf.save(fileName);
        } catch (err) {
          pdf.save("final-scorecard.pdf");
        }

        // close modal and return to setup/home
        setFinalModalOpen(false);
        setPage("setup");
      })
      .catch((err) => {
        console.error("PDF generation failed:", err);
        alert("Failed to generate PDF. See console for details.");
      });
  };

  const renderInningsHtml = (snap) => {
    if (!snap) return "<div>No data</div>";
    const bats = snap.batsmen || {};
    const bowlers = snap.bowlerStats || {};
    const batsRows = Object.values(bats).map((b) => {
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-";
      return `<tr><td>${escapeHtml(b.name)}</td><td>${b.runs}</td><td>${b.balls}</td><td>${b.fours}</td><td>${b.sixes}</td><td>${sr}</td><td>${escapeHtml(b.status)}</td></tr>`;
    }).join("");
    const bowlRows = Object.entries(bowlers).map(([name, s]) => {
      const econ = s.balls > 0 ? (s.runs / (s.balls / 6)).toFixed(2) : "-";
      return `<tr><td>${escapeHtml(name)}</td><td>${formatOvers(s.balls)}</td><td>${s.runs}</td><td>${s.wickets}</td><td>${econ}</td></tr>`;
    }).join("");
    const extrasTotal = snap.extrasBreakdown ? 
      Object.values(snap.extrasBreakdown).reduce((sum, val) => sum + val, 0) : 
      (snap.extras || 0);
    
    let extrasBreakdownHtml = "";
    if (snap.extrasBreakdown) {
      const { wides, noBalls, byes, legByes, negative } = snap.extrasBreakdown;
      extrasBreakdownHtml = `<div>Extras: ${extrasTotal} (Wide: ${wides}, No Ball: ${noBalls}, Bye: ${byes}, Leg Bye: ${legByes}, Negative: ${negative})</div>`;
    } else {
      extrasBreakdownHtml = `<div>Extras: ${extrasTotal}</div>`;
    }
    
    return `
      <table>
        <thead><tr><th>Batsman</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th><th>Status</th></tr></thead>
        <tbody>${batsRows}</tbody>
      </table>
      ${extrasBreakdownHtml}
      <table>
        <thead><tr><th>Bowler</th><th>O</th><th>R</th><th>W</th><th>Econ</th></tr></thead>
        <tbody>${bowlRows}</tbody>
      </table>
    `;
  };

  const escapeHtml = (str) => {
    if (!str && str !== 0) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  /**
   * recordDelivery
   * - now supports dynamic currentOverBalls (stores every delivery with text and whether it's legal)
   * - extrasDelta no longer mutates bowlerStats directly (keeps negative-run/extra handling separate)
   */
  const recordDelivery = ({ type, runs = 0, wicketDetails = null, extrasDelta = 0, skipNegativePrompt = false }) => {
    pushSnapshot();
    let r = 0;

    let newTotalRuns = totalRuns;
    let newTotalWickets = totalWickets;
    let newBalls = balls;
    const batsCopy = clone(batsmen);
    const bowlCopy = clone(bowlerStats);
    let newStriker = striker;
    let newNon = nonStriker;
    let newExtrasBreakdown = clone(extrasBreakdown);
    let newCurrentOverBalls = [...currentOverBalls];
    let newDeliveryHistory = [...deliveryHistory];

    const startStriker = newStriker;
    const startNon = newNon;

    if (currentBowler) ensureBowler(currentBowler, bowlCopy);

    const isWideOrNoBall = type === "wide" || type === "noball";
    const countsAsLegal = !isWideOrNoBall;

    const swapLocalStrikes = () => {
      const tmp = newStriker;
      newStriker = newNon;
      newNon = tmp;
    };

    // Record ball result for history
    const ballIndex = newBalls % 6;
    const deliveryData = {
      type,
      runs,
      wicketDetails,
      ballIndex,
      striker: newStriker,
      nonStriker: newNon,
      bowler: currentBowler
    };
    
    // Add to delivery history
    newDeliveryHistory.push(deliveryData);

    // Build a descriptive text for currentOverBalls entry
    const buildDeliveryText = () => {
      if (type === "run" || type === "manual") {
        return `${runs}`;
      } else if (type === "wicket") {
        return "W";
      } else if (type === "wide") {
        return `WD${runs && runs !== 1 ? `+${runs}` : ""}`;
      } else if (type === "noball") {
        // show batsman runs if >1
        const batsmanRuns = (Number(runs) || 1) - 1;
        return `NB${batsmanRuns > 0 ? `+${batsmanRuns}` : ""}`;
      } else if (type === "bye") {
        return `B${runs && runs !== 1 ? `+${runs}` : ""}`;
      } else if (type === "legbye") {
        return `LB${runs && runs !== 1 ? `+${runs}` : ""}`;
      }
      return "-";
    };

    // APPLY extrasDelta WITHOUT counting the ball (so wicket logic will handle the ball increment)
    if (extrasDelta && typeof extrasDelta === "number" && extrasDelta !== 0) {
      newTotalRuns += extrasDelta;
      newExtrasBreakdown.negative += Math.abs(extrasDelta);
      // IMPORTANT: Do NOT mutate bowlerStats with extrasDelta (keeps negative runs separate from bowler stats)
      // (this preserves your request: negative/manual extras should not change bowler run totals)
      // DO NOT increment batsman balls or newBalls here for extrasDelta — wicket will count the ball if needed.
    }

    if (type === "run" || type === "manual") {
      // ensure 'r' is a number
      r = Number(runs) || 0;

      // Manual deliveries: do not allow negative here (manual can't be negative)
      if (type === "manual" && r < 0) {
        alert("Manual runs cannot be negative. Use Wicket > Negative Runs for deductions.");
        return;
      }

      // Normal positive/manual >= 0 runs
      newTotalRuns += r;
      ensureBatsman(newStriker, batsCopy);

      // count ball for normal deliveries and for manual positive
      batsCopy[newStriker].balls += 1;
      if (currentBowler) bowlCopy[currentBowler].balls += 1;
      newBalls += 1;

      if (r > 0) {
        batsCopy[newStriker].runs += r;
        if (r === 4) batsCopy[newStriker].fours += 1;
        if (r === 6) batsCopy[newStriker].sixes += 1;
      }

      if (currentBowler) {
        bowlCopy[currentBowler].runs += r;
      }

      // Apply strike swap on odd runs (works for manual and normal runs now)
      if (r % 2 === 1) swapLocalStrikes();

      // Add the textual record for this delivery
      newCurrentOverBalls.push({ text: buildDeliveryText(), legal: countsAsLegal });
    }

    else if (type === "wicket") {
      const wd = wicketDetails || {};
      const runOutInfo = wd.runOut || null;

      // If runOut had runsBefore, apply them (this counts as part of wicket ball)
      if (runOutInfo && Number(runOutInfo.runsBefore)) {
        const runsBefore = Number(runOutInfo.runsBefore);
        ensureBatsman(newStriker, batsCopy);
        batsCopy[newStriker].runs += runsBefore;
        batsCopy[newStriker].balls += 1;
        newTotalRuns += runsBefore;
        if (currentBowler) {
          bowlCopy[currentBowler].runs += runsBefore;
          bowlCopy[currentBowler].balls += 1;
        }
        newBalls += 1;
        if (runsBefore % 2 === 1) swapLocalStrikes();
      } else {
        // count the legal ball for the wicket (only here)
        newBalls += 1;
        if (currentBowler) bowlCopy[currentBowler].balls += 1;

        // 🟢 FIX: Increment batsman balls for ALL wickets except certain run out non-striker cases
        if (runOutInfo) {
          const end = runOutInfo.end || "Striker End";
          const whoOutNorm = (runOutInfo.whoOut || "").toLowerCase();
          if (!(end === "Non-Striker End" && whoOutNorm === "non-striker")) {
            let outBatterName =
              whoOutNorm === "striker"
                ? startStriker
                : whoOutNorm === "non-striker"
                ? startNon
                : end === "Striker End"
                ? newStriker
                : newNon;
            ensureBatsman(outBatterName, batsCopy);
            batsCopy[outBatterName].balls += 1;
          }
        } else {
          // regular wicket – always increment out batsman’s balls
          let outName = wd.outName?.trim() || newStriker;
          ensureBatsman(outName, batsCopy);
          batsCopy[outName].balls += 1;
        }
      }

      if (runOutInfo) {
        const end = runOutInfo.end || "Striker End";
        const whoOutNorm = (runOutInfo.whoOut || "").toLowerCase();
        let outBatterName =
          whoOutNorm === "striker"
            ? startStriker
            : whoOutNorm === "non-striker"
            ? startNon
            : end === "Striker End"
            ? newStriker
            : newNon;

        ensureBatsman(outBatterName, batsCopy);
        batsCopy[outBatterName].status = `out (Run Out)`;

        const replacement = wd.newBatsman?.trim() || null;
        const survivor = outBatterName === startStriker ? startNon : startStriker;

        const isLastBall = countsAsLegal && newBalls > 0 && newBalls % 6 === 0;

        if (isLastBall) {
          if (end === "Striker End") {
            newStriker = survivor;
            newNon = replacement || "-----";
          } else {
            newStriker = replacement || "-----";
            newNon = survivor;
          }
        } else {
          if (end === "Striker End") {
            newStriker = replacement || "-----";
            newNon = survivor;
          } else {
            newNon = replacement || "-----";
            newStriker = survivor;
          }
        }

        if (replacement) {
          batsCopy[replacement] = { name: replacement, runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting" };
        }

        newTotalWickets += 1;
      } else {
        const method = wd.method || "Out";
        let outName = wd.outName?.trim() || newStriker;
        ensureBatsman(outName, batsCopy);
        batsCopy[outName].status = `out (${method})`;
        if (currentBowler && method !== "Run Out") bowlCopy[currentBowler].wickets += 1;
        const replacement = wd.newBatsman?.trim();
        if (replacement) {
          batsCopy[replacement] = { name: replacement, runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting" };
          if (outName === newStriker) newStriker = replacement;
          else if (outName === newNon) newNon = replacement;
          else newStriker = replacement;
        } else {
          if (outName === newStriker) newStriker = "-----";
          else if (outName === newNon) newNon = "-----";
        }
        newTotalWickets += 1;
      }

      // Add to over balls
      newCurrentOverBalls.push({ text: buildDeliveryText(), legal: countsAsLegal });
    }

    else if (type === "wide") {
      r = Number(runs) || 1;
      newTotalRuns += r;
      newExtrasBreakdown.wides += r;
      if (currentBowler) bowlCopy[currentBowler].runs += r;
      // wides do NOT count as legal ball; they still get recorded in the over details array
      newCurrentOverBalls.push({ text: buildDeliveryText(), legal: false });
      // If runs from wides are even and cause strike change? We follow earlier logic: swap if r%2 === 0 (as your earlier code attempted)
      if (r > 0 && r % 2 === 1) {
        // odd wides won't change strike in most interpretations because they are extras - keep behavior consistent with your previous code (which swapped on even wides)
      } else if (r > 0 && r % 2 === 0) {
        // previous code swapped on even wides; keep previous behavior: swap if even
        swapLocalStrikes();
      }
    }

    else if (type === "noball") {
      r = Number(runs) || 1;
      const batsmanRuns = r - 1; // 1 run is for no ball, rest goes to batsman
      
      // Add 1 run to extras for no ball
      newTotalRuns += 1;
      newExtrasBreakdown.noBalls += 1;
      
      // Add batsman runs to batsman and total
      if (batsmanRuns > 0) {
        ensureBatsman(newStriker, batsCopy);
        batsCopy[newStriker].runs += batsmanRuns;
        if (batsmanRuns === 4) batsCopy[newStriker].fours += 1;
        if (batsmanRuns === 6) batsCopy[newStriker].sixes += 1;
        newTotalRuns += batsmanRuns;
        
        // Swap strike if odd number of runs
        if (batsmanRuns % 2 === 1) swapLocalStrikes();
      }
      
      if (currentBowler) {
        bowlCopy[currentBowler].runs += r;
      }
      
      newCurrentOverBalls.push({ text: buildDeliveryText(), legal: false });
    }

    else if (type === "bye") {
      r = Number(runs) || 1;
      newTotalRuns += r;
      newExtrasBreakdown.byes += r;
      if (currentBowler) {
        bowlCopy[currentBowler].runs += r;
        bowlCopy[currentBowler].balls += 1;
      }
      ensureBatsman(newStriker, batsCopy);
      batsCopy[newStriker].balls += 1;
      newBalls += 1;
      if (r % 2 === 1) swapLocalStrikes();
      newCurrentOverBalls.push({ text: buildDeliveryText(), legal: true });
    }

    else if (type === "legbye") {
      r = Number(runs) || 1;
      newTotalRuns += r;
      newExtrasBreakdown.legByes += r;
      if (currentBowler) {
        bowlCopy[currentBowler].runs += r;
        bowlCopy[currentBowler].balls += 1;
      }
      ensureBatsman(newStriker, batsCopy);
      batsCopy[newStriker].balls += 1;
      newBalls += 1;
      if (r % 2 === 1) swapLocalStrikes();
      newCurrentOverBalls.push({ text: buildDeliveryText(), legal: true });
    }

    // Check if over is complete and swap batsmen
    if (countsAsLegal && newBalls > 0 && newBalls % 6 === 0) {
      // Swap striker and non-striker at the end of the over
      const tmp = newStriker;
      newStriker = newNon;
      newNon = tmp;
      
      // Reset over balls for next over (dynamic reset)
      newCurrentOverBalls = [];
      newDeliveryHistory = [];
    }

    // apply the computed state (this ensures runs from this delivery are in place before match-end logic)
    setTotalRuns(newTotalRuns);
    setTotalWickets(newTotalWickets);
    setBalls(newBalls);
    setBatsmen(batsCopy);
    setBowlerStats(bowlCopy);
    setStriker(newStriker);
    setNonStriker(newNon);
    setExtrasBreakdown(newExtrasBreakdown);
    setCurrentOverBalls(newCurrentOverBalls);
    setDeliveryHistory(newDeliveryHistory);

    // Update run rates
    const newRunRate = calculateRunRate(newTotalRuns, newBalls);
    setCurrentRunRate(newRunRate);
    
    if (innings === 2) {
      const newRequiredRunRate = calculateRequiredRunRate();
      setRequiredRunRate(newRequiredRunRate);
    }
    
    // Update partnership
    if (currentPartnership.batsman1 === newStriker || currentPartnership.batsman2 === newStriker) {
      setCurrentPartnership(prev => ({
        ...prev,
        runs: prev.runs + (type === "run" || type === "manual" ? (Number(runs) || 0) : 0),
        balls: prev.balls + (countsAsLegal ? 1 : 0)
      }));
    }
    ;
    
    // Check for milestones
    checkMilestone(newTotalRuns, newTotalWickets);

    // If innings 1 finished due to overs limit -> start second innings flow
    if (innings === 1 && oversLimitNum && newBalls >= oversLimitNum * 6) {
      // capture first innings snapshot BEFORE clearing bowler/batsman for second innings
      const firstSnapshot = {
        battingTeam,
        totalRuns: newTotalRuns,
        totalWickets: newTotalWickets,
        balls: newBalls,
        batsmen: clone(batsCopy),
        bowlerStats: clone(bowlCopy),
        extras: Object.values(newExtrasBreakdown).reduce((sum, val) => sum + val, 0),
        extrasBreakdown: newExtrasBreakdown,
      };
      setFirstInningsScore(newTotalRuns);
      setTarget(newTotalRuns + 1);

      // open second innings modal and clear live bowler list inside it
      openStartSecondModal(firstSnapshot);
      return; // stop other prompts
    }

    // During innings 2 check for target reached or overs finished
    if (innings === 2) {
      // First, if target reached or exceeded -> batting team wins
      if (target !== null && newTotalRuns >= target) {
        const secondSnapshot = {
          battingTeam,
          totalRuns: newTotalRuns,
          totalWickets: newTotalWickets,
          balls: newBalls,
          batsmen: clone(batsCopy),
          bowlerStats: clone(bowlCopy),
          extras: Object.values(newExtrasBreakdown).reduce((sum, val) => sum + val, 0),
          extrasBreakdown: newExtrasBreakdown,
        };
        openFinalSummary(secondSnapshot, `${battingTeam} wins! (${newTotalRuns} / ${newTotalWickets})`);
        return;
      }

      // If overs finished (or last ball) -> decide winner or tie
      if (oversLimitNum && newBalls >= oversLimitNum * 6) {
        const F = firstInningsScore !== null ? firstInningsScore : 0;
        let resultText;
        if (newTotalRuns === F) {
          resultText = "MATCH TIED";
        } else {
          // if chase exceeded F it would have been caught by target check above.
          const winner = newTotalRuns > F ? battingTeam : (battingTeam === team1 ? team2 : team1);
          resultText = `${winner} wins!`;
        }
        const secondSnapshot = {
          battingTeam,
          totalRuns: newTotalRuns,
          totalWickets: newTotalWickets,
          balls: newBalls,
          batsmen: clone(batsCopy),
          bowlerStats: clone(bowlCopy),
          extras: Object.values(newExtrasBreakdown).reduce((sum, val) => sum + val, 0),
          extrasBreakdown: newExtrasBreakdown,
        };
        openFinalSummary(secondSnapshot, resultText);
        return;
      }
    }

    // normal over-complete next bowler prompt (only if innings still running and not just handed to second innings)
    if (countsAsLegal && newBalls > 0 && newBalls % 6 === 0) {
      if (!(innings === 1 && oversLimitNum && newBalls >= oversLimitNum * 6)) {
        // Open bowler selection modal instead of prompt
        setBowlerSelectionOpen(true);
      }
    }
  };

  const undo = () => {
    if (history.length === 0) {
      alert("Nothing to undo");
      return;
    }
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    restoreSnapshot(last);
    
    // Recalculate run rates and partnership
    const newRunRate = calculateRunRate(last.totalRuns, last.balls);
    setCurrentRunRate(newRunRate);
    
    if (innings === 2) {
      const newRequiredRunRate = calculateRequiredRunRate();
      setRequiredRunRate(newRequiredRunRate);
    }
    
    updatePartnership();
    
    // Reconstruct current over balls from the snapshot (simpler & robust)
    setCurrentOverBalls(last.currentOverBalls || []);
    setDeliveryHistory(last.deliveryHistory || []);
  };

  const swapBats = () => {
    pushSnapshot();
    const s = striker;
    const n = nonStriker;
    setStriker(n);
    setNonStriker(s);
    updatePartnership();
  };

  const retire = (which) => {
    pushSnapshot();
    if (which === "S") {
      // Prompt first; only mark 'retired' if user confirms / provides replacement
      const newName = window.prompt("Enter replacement striker name (leave empty to cancel):", "");
      if (!newName) return; // Cancelled -> do nothing

      setBatsmen((prev) => {
        const copy = clone(prev);
        if (copy[striker]) copy[striker].status = "retired";
        copy[newName] = { name: newName, runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting" };
        return copy;
      });
      setStriker(newName);
    } else {
      const newName = window.prompt("Enter replacement non-striker name (leave empty to cancel):", "");
      if (!newName) return; // Cancelled
      setBatsmen((prev) => {
        const copy = clone(prev);
        if (copy[nonStriker]) copy[nonStriker].status = "retired";
        copy[newName] = { name: newName, runs: 0, balls: 0, fours: 0, sixes: 0, status: "batting" };
        return copy;
      });
      setNonStriker(newName);
    }
    updatePartnership();
  };

  const changeBowler = () => {
    pushSnapshot();
    setBowlerSelectionOpen(true);
  };

  const openWicketPanel = () => {
    setWicketForm((prev) => ({
      ...prev,
      outName: striker || "",
      method: "Bowled",
      helper: "",
      newBatsman: "",
      isRunOut: false,
      runOutWhichBatter: "Striker",
      runOutEnd: "Striker End",
      runsBefore: 0,
    }));
    setWicketPanelOpen(true);
  };

  const submitWicketPanel = () => {
    const wf = { ...wicketForm };

    // require new batsman name
    if (!wf.newBatsman || wf.newBatsman.trim() === "") {
      alert("New batsman name is required. Please enter a name.");
      return;
    }

    // If user selected the special Negative Runs method, ask for penalty and apply as extrasDelta
    if (wf.method === "Negative Runs") {
      const penaltyStr = window.prompt("Enter runs to deduct (positive number):", "1");
      const penalty = Math.abs(Number(penaltyStr) || 0);
      if (penalty <= 0) {
        alert("Invalid penalty. Cancelled.");
        return;
      }

      const wicketDetails = {
        method: "Negative Runs",
        helper: wf.helper,
        newBatsman: wf.newBatsman,
        outName: wf.outName,
      };

      setWicketPanelOpen(false);

      // Apply as wicket with extrasDelta negative (deducts runs from total/extras but NOT from bowler)
      recordDelivery({ type: "wicket", wicketDetails, extrasDelta: -penalty });
      return;
    }

    const wicketDetails = {
      method: wf.method,
      helper: wf.helper,
      newBatsman: wf.newBatsman,
      outName: wf.outName,
    };
    if (wf.isRunOut) {
      wicketDetails.runOut = {
        whoOut: wf.runOutWhichBatter,
        end: wf.runOutEnd,
        runsBefore: Number(wf.runsBefore) || 0,
      };
    }

    setWicketPanelOpen(false);

    // Normal wicket handling
    recordDelivery({ type: "wicket", wicketDetails });
  };

  const handleManualRunsSubmit = () => {
    const runs = parseInt(manualRunsValue, 10) || 0;
    if (runs < 0) {
      alert("Manual runs cannot be negative. Use Wicket > Negative Runs to apply deductions.");
      return;
    }
    recordDeliveryWithAnimation({ type: "manual", runs });
    setManualRunsOpen(false);
    setManualRunsValue("");
  };

  const getOrderedBatsmen = () => {
    const used = new Set();
    const result = [];

    if (striker && batsmen[striker]) {
      result.push(batsmen[striker]);
      used.add(striker);
    }

    if (nonStriker && nonStriker !== striker && batsmen[nonStriker]) {
      result.push(batsmen[nonStriker]);
      used.add(nonStriker);
    }

    // other currently batting
    Object.values(batsmen).forEach((b) => {
      if (!used.has(b.name) && b.status === "batting") {
        result.push(b);
        used.add(b.name);
      }
    });

    // out / retired players after
    Object.values(batsmen).forEach((b) => {
      if (!used.has(b.name)) {
        result.push(b);
        used.add(b.name);
      }
    });

    return result;
  };

  // Function to capitalize names
  const capitalizeName = (name) => {
    if (!name) return "";
    return name.toUpperCase();
  };

  // UI: login
  if (page === "login") {
    return (
      <AppContainer darkMode={darkMode}>
        <Header>
          <Logo>
            🏏 Cricket Scoring App
          </Logo>
          <DarkModeToggle onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </DarkModeToggle>
        </Header>
        <MainContent>
          <Card style={{ maxWidth: '500px', margin: '0 auto' }} darkMode={darkMode}>
            <CardTitle darkMode={darkMode}>Login</CardTitle>
            <FormColumn>
              <Input 
                type="tel" 
                placeholder="Phone (dummy)" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                darkMode={darkMode}
              />
              <Button primary onClick={() => setPage("setup")}>Login (dummy)</Button>
            </FormColumn>
          </Card>
        </MainContent>
      </AppContainer>
    );
  }

  // UI: setup
  if (page === "setup") {
    return (
      <AppContainer darkMode={darkMode}>
        <Header>
          <Logo>
            🏏 Cricket Scoring App
          </Logo>
          <DarkModeToggle onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </DarkModeToggle>
        </Header>
        <MainContent>
          <Card darkMode={darkMode}>
            <CardTitle darkMode={darkMode}>Match Setup</CardTitle>
            
            {/* Team 1 Setup */}
            <FormRow>
              <FormColumn>
                <TeamSetupContainer>
                  <TeamLogoContainer>
                    {team1Logo ? (
                      <TeamLogoPreview src={team1Logo} alt="Team 1 Logo" />
                    ) : (
                      <span>🏏</span>
                    )}
                  </TeamLogoContainer>
                  <TeamDetails>
                    <Input 
                      placeholder="Team 1" 
                      value={team1} 
                      onChange={(e) => setTeam1(capitalizeName(e.target.value))}
                      darkMode={darkMode}
                    />
                    <FileUpload>
                      <FileUploadInput
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleTeamLogoUpload(1, e)}
                      />
                      <FileUploadLabel darkMode={darkMode}>
                        📷 Upload Logo
                      </FileUploadLabel>
                    </FileUpload>
                    <Button onClick={() => openSquadModal(1)}>
                      👥 Manage Squad
                    </Button>
                  </TeamDetails>
                </TeamSetupContainer>
              </FormColumn>
              
              <FormColumn style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <strong>VS</strong>
              </FormColumn>
              
              {/* Team 2 Setup */}
              <FormColumn>
                <TeamSetupContainer>
                  <TeamLogoContainer>
                    {team2Logo ? (
                      <TeamLogoPreview src={team2Logo} alt="Team 2 Logo" />
                    ) : (
                      <span>🏏</span>
                    )}
                  </TeamLogoContainer>
                  <TeamDetails>
                    <Input 
                      placeholder="Team 2" 
                      value={team2} 
                      onChange={(e) => setTeam2(capitalizeName(e.target.value))}
                      darkMode={darkMode}
                    />
                    <FileUpload>
                      <FileUploadInput
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleTeamLogoUpload(2, e)}
                      />
                      <FileUploadLabel darkMode={darkMode}>
                        📷 Upload Logo
                      </FileUploadLabel>
                    </FileUpload>
                    <Button onClick={() => openSquadModal(2)}>
                      👥 Manage Squad
                    </Button>
                  </TeamDetails>
                </TeamSetupContainer>
              </FormColumn>
            </FormRow>
            
            <FormRow>
              <FormColumn>
                <label>Toss Winner:</label>
                <Select value={tossWinner} onChange={(e) => setTossWinner(capitalizeName(e.target.value))} darkMode={darkMode}>
                  <option value="">Select</option>
                  <option value={team1}>{team1 || "Team 1"}</option>
                  <option value={team2}>{team2 || "Team 2"}</option>
                </Select>
              </FormColumn>
              <FormColumn>
                <label>Decision:</label>
                <Select value={decision} onChange={(e) => setDecision(e.target.value)} darkMode={darkMode}>
                  <option value="">Select</option>
                  <option value="Batting">Batting</option>
                  <option value="Bowling">Bowling</option>
                </Select>
              </FormColumn>
            </FormRow>
            
            <FormRow>
              <FormColumn>
                <Input 
                  type="number" 
                  placeholder="Overs (e.g., 20)" 
                  value={oversLimit} 
                  onChange={(e) => setOversLimit(e.target.value)}
                  darkMode={darkMode}
                />
              </FormColumn>
              <FormColumn>
                <Input 
                  placeholder="Ground" 
                  value={ground} 
                  onChange={(e) => setGround(capitalizeName(e.target.value))}
                  darkMode={darkMode}
                />
              </FormColumn>
              <FormColumn>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  darkMode={darkMode}
                />
              </FormColumn>
            </FormRow>
            
            <CardTitle style={{ fontSize: '1.2rem', marginTop: '1.5rem' }} darkMode={darkMode}>Initial Players</CardTitle>
            <FormRow>
              <FormColumn>
                <label>Striker batsman:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Input 
                    placeholder="Striker batsman" 
                    value={setupStriker} 
                    onChange={(e) => setSetupStriker(capitalizeName(e.target.value))}
                    darkMode={darkMode}
                  />
                  <Button onClick={() => setSquadModalOpen(true)}>
                    👥
                  </Button>
                </div>
              </FormColumn>
              <FormColumn>
                <label>Non-striker batsman:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Input 
                    placeholder="Non-striker batsman" 
                    value={setupNonStriker} 
                    onChange={(e) => setSetupNonStriker(capitalizeName(e.target.value))}
                    darkMode={darkMode}
                  />
                  <Button onClick={() => setSquadModalOpen(true)}>
                    👥
                  </Button>
                </div>
              </FormColumn>
              <FormColumn>
                <label>Bowler:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Input 
                    placeholder="Bowler" 
                    value={setupBowler} 
                    onChange={(e) => setSetupBowler(capitalizeName(e.target.value))}
                    darkMode={darkMode}
                  />
                  <Button onClick={() => setBowlerSelectionOpen(true)}>
                    🎯
                  </Button>
                </div>
              </FormColumn>
            </FormRow>
            
            {/* Initial Players Display */}
            {(setupStriker || setupNonStriker || setupBowler) && (
              <InitialPlayersDisplay darkMode={darkMode}>
                <PlayerRole>
                  <div className="role-label">STRIKER</div>
                  <div className="player-name">{setupStriker || "Not set"}</div>
                </PlayerRole>
                <PlayerRole>
                  <div className="role-label">NON-STRIKER</div>
                  <div className="player-name">{setupNonStriker || "Not set"}</div>
                </PlayerRole>
                <PlayerRole>
                  <div className="role-label">BOWLER</div>
                  <div className="player-name">{setupBowler || "Not set"}</div>
                </PlayerRole>
              </InitialPlayersDisplay>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Button primary onClick={startMatch}>Start Match</Button>
            </div>
          </Card>
        </MainContent>
        
        {/* Squad Modal */}
        {squadModalOpen && (
          <Modal>
            <ModalContent darkMode={darkMode}>
              <ModalHeader>
                <ModalTitle darkMode={darkMode}>
                  {currentSquadTeam === 1 ? team1 : team2} Squad
                </ModalTitle>
                <CloseButton onClick={() => setSquadModalOpen(false)}>×</CloseButton>
              </ModalHeader>
              
              <FormRow>
                <FormColumn>
                  <Input 
                    placeholder="Player name" 
                    value={newPlayerName} 
                    onChange={(e) => setNewPlayerName(capitalizeName(e.target.value))}
                    darkMode={darkMode}
                  />
                </FormColumn>
                <FormColumn>
                  <Button onClick={addPlayerToSquad}>Add Player</Button>
                </FormColumn>
              </FormRow>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {(currentSquadTeam === 1 ? team1Squad : team2Squad).map((player, index) => (
                  <div key={index} style={{ 
                    padding: '0.5rem', 
                    borderBottom: `1px solid ${darkMode ? '#444' : '#eee'}`,
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{player}</span>
                    <div>
                      <Button onClick={() => selectPlayerFromSquad(player, 'striker')}>🏏</Button>
                      <Button onClick={() => selectPlayerFromSquad(player, 'nonStriker')}>🏏</Button>
                      <Button onClick={() => selectPlayerFromSquad(player, 'bowler')}>🎯</Button>
                    </div>
                  </div>
                ))}
              </div>
            </ModalContent>
          </Modal>
        )}
        
        {/* Bowler Selection Modal */}
        {bowlerSelectionOpen && (
          <Modal>
            <BowlerSelectionModal darkMode={darkMode}>
              <BowlerSelectionHeader>
                <h3>Select Bowler</h3>
              </BowlerSelectionHeader>
              
              <FormRow>
                <FormColumn>
                  <Input 
                    placeholder="New bowler name" 
                    value={newBowlerName} 
                    onChange={(e) => setNewBowlerName(capitalizeName(e.target.value))}
                    darkMode={darkMode}
                  />
                </FormColumn>
                <FormColumn>
                  <Button onClick={addBowler}>Add Bowler</Button>
                </FormColumn>
              </FormRow>
              
              <BowlerList>
                {savedBowlers.map((bowler, index) => (
                  <BowlerOption 
                    key={index} 
                    onClick={() => selectBowler(bowler)}
                    selected={currentBowler === bowler}
                    darkMode={darkMode}
                  >
                    {bowler}
                  </BowlerOption>
                ))}
              </BowlerList>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <Button onClick={() => setBowlerSelectionOpen(false)}>Cancel</Button>
              </div>
            </BowlerSelectionModal>
          </Modal>
        )}
      </AppContainer>
    );
  }

  // UI: match
  return (
    <AppContainer darkMode={darkMode}>
      <Header>
        <TeamNameWithLogo>
          {team1Logo && <TeamLogo src={team1Logo} alt={team1} />}
          <Logo>
            {team1} vs {team2}
          </Logo>
          {team2Logo && <TeamLogo src={team2Logo} alt={team2} />}
        </TeamNameWithLogo>
        <DarkModeToggle onClick={toggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </DarkModeToggle>
      </Header>
      <MainContent>
        <Card darkMode={darkMode}>
          <TeamInfo>
            <h2>{team1} vs {team2}</h2>
            <div>
              <Button onClick={() => { if (window.confirm("End match and return to setup? (state kept until reload)")) setPage("setup"); }}>
                End Match
              </Button>
            </div>
          </TeamInfo>
          <MatchInfo>
            <InfoItem>📍 {ground}</InfoItem>
            <InfoItem>📅 {date}</InfoItem>
            <InfoItem>🎯 Toss: {tossWinner} chose {decision}</InfoItem>
            <InfoItem>🏏 Innings: {innings}</InfoItem>
            <InfoItem>👥 Batting: {battingTeam}</InfoItem>
            {innings === 2 && target && <InfoItem>🎯 Target: {target}</InfoItem>}
          </MatchInfo>
        </Card>

        <ScoreDisplay>
          <div>Score</div>
          <ScoreMain highlight={highlightMilestone}>{totalRuns}/{totalWickets}</ScoreMain>
          <ScoreDetails>{formatOvers(balls)} overs {oversLimitNum ? `of ${oversLimitNum}` : ""}</ScoreDetails>
          
          {/* Required runs display for second innings */}
          {innings === 2 && target && (
            <RequiredRunsDisplay>
              {calculateRequiredRunsAndBalls().runs} runs required of {calculateRequiredRunsAndBalls().balls} balls
            </RequiredRunsDisplay>
          )}
          
          {/* Extras breakdown */}
          <ScoreDetails>
            <div>Extras: {Object.values(extrasBreakdown).reduce((sum, val) => sum + val, 0)}</div>
            <ExtrasBreakdown>
              {extrasBreakdown.wides > 0 && <ExtraItem>Wide: {extrasBreakdown.wides}</ExtraItem>}
              {extrasBreakdown.noBalls > 0 && <ExtraItem>No Ball: {extrasBreakdown.noBalls}</ExtraItem>}
              {extrasBreakdown.byes > 0 && <ExtraItem>Bye: {extrasBreakdown.byes}</ExtraItem>}
              {extrasBreakdown.legByes > 0 && <ExtraItem>Leg Bye: {extrasBreakdown.legByes}</ExtraItem>}
              {extrasBreakdown.negative > 0 && <ExtraItem>Negative: {extrasBreakdown.negative}</ExtraItem>}
            </ExtrasBreakdown>
          </ScoreDetails>
          
          <RunRateDisplay>
            <RunRateItem>
              <RunRateLabel>CRR</RunRateLabel>
              <RunRateValue>{currentRunRate}</RunRateValue>
            </RunRateItem>
            {innings === 2 && target && (
              <RunRateItem>
                <RunRateLabel>RRR</RunRateLabel>
                <RunRateValue>{requiredRunRate}</RunRateValue>
              </RunRateItem>
            )}
          </RunRateDisplay>
        </ScoreDisplay>

        {/* Partnership Display */}
        {currentPartnership.runs > 0 && (
          <PartnershipDisplay darkMode={darkMode}>
            <PartnershipTitle darkMode={darkMode}>
              Current Partnership: {currentPartnership.batsman1} & {currentPartnership.batsman2}
            </PartnershipTitle>
            <PartnershipDetails>
              <span>Runs: {currentPartnership.runs}</span>
              <span>Balls: {currentPartnership.balls}</span>
            </PartnershipDetails>
          </PartnershipDisplay>
        )}

        {/* Scoring Actions Card - replacing Run Rate Chart */}
        <Card darkMode={darkMode}>
          <CardTitle darkMode={darkMode}>Scoring Actions</CardTitle>
          <ActionButtons>
            <RunButton run={0} onClick={() => recordDeliveryWithAnimation({ type: "run", runs: 0 })} animate={animateBall}>
              🏏 0
            </RunButton>
            <RunButton run={1} onClick={() => recordDeliveryWithAnimation({ type: "run", runs: 1 })} animate={animateBall}>
              🏏 1
            </RunButton>
            <RunButton run={2} onClick={() => recordDeliveryWithAnimation({ type: "run", runs: 2 })} animate={animateBall}>
              🏏 2
            </RunButton>
            <RunButton run={3} onClick={() => recordDeliveryWithAnimation({ type: "run", runs: 3 })} animate={animateBall}>
              🏏 3
            </RunButton>
            <RunButton run={4} onClick={() => recordDeliveryWithAnimation({ type: "run", runs: 4 })} animate={animateBall}>
              🏏 4
            </RunButton>
            <RunButton run={6} onClick={() => recordDeliveryWithAnimation({ type: "run", runs: 6 })} animate={animateBall}>
              🏏 6
            </RunButton>
            <Button onClick={() => setManualRunsOpen(true)}>
              📝 Manual
            </Button>
          </ActionButtons>
          
          <ActionButtons>
            <WicketButton onClick={openWicketPanel}>
              🎯 Wicket
            </WicketButton>
            <ExtrasButton onClick={() => { 
  const input = window.prompt("Wide runs (default 1):", "1");
  // If user cancelled the prompt, input will be null — do nothing
  if (input === null) return;
  const parsed = parseInt((input || "1").trim(), 10);
  if (isNaN(parsed)) return; // invalid input -> do nothing
  const r = Math.max(1, parsed);
  recordDeliveryWithAnimation({ type: "wide", runs: r }); 
}}>
  📏 Wide
</ExtrasButton>

<ExtrasButton onClick={() => { 
  const input = window.prompt("No-ball runs (default 1):", "1");
  if (input === null) return; // user cancelled -> do nothing
  const parsed = parseInt((input || "1").trim(), 10);
  if (isNaN(parsed)) return;
  const r = Math.max(1, parsed);
  recordDeliveryWithAnimation({ type: "noball", runs: r }); 
}}>
  ⚡ No Ball
</ExtrasButton>

            <ExtrasButton onClick={() => { 
              const r = parseInt(window.prompt("Bye runs (default 1):", "1") || "1", 10) || 1; 
              recordDeliveryWithAnimation({ type: "bye", runs: r }); 
            }}>
              ➡️ Bye
            </ExtrasButton>
            <ExtrasButton onClick={() => { 
              const r = parseInt(window.prompt("Leg-bye runs (default 1):", "1") || "1", 10) || 1; 
              recordDeliveryWithAnimation({ type: "legbye", runs: r }); 
            }}>
              ↗️ Leg Bye
            </ExtrasButton>
          </ActionButtons>
          
          <ActionButtons>
            <Button onClick={undo}>↩️ Undo</Button>
            <Button onClick={() => retire("S")}>🏃 Retire Striker</Button>
            <Button onClick={() => retire("N")}>🏃 Retire Non-Striker</Button>
            <Button onClick={swapBats}>🔄 Swap Batsmen</Button>
            <Button onClick={changeBowler}>🎯 Change Bowler</Button>
          </ActionButtons>
        </Card>

        <MobileScorecard>
          <MobileCard darkMode={darkMode}>
            <CardTitle darkMode={darkMode}>Batting</CardTitle>
            <TableContainer>
              <Table darkMode={darkMode}>
                <thead>
                  <tr>
                    <th>Batsman</th>
                    <th>R</th>
                    <th>B</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>SR</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getOrderedBatsmen().map((b) => {
                    const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-";
                    const isCurrentPlayer = b.name === striker || b.name === nonStriker;
                    return (
                      <tr key={b.name} className={isCurrentPlayer ? 'current-player' : ''}>
                        <td>{b.name}</td>
                        <td>{b.runs}</td>
                        <td>{b.balls}</td>
                        <td>{b.fours}</td>
                        <td>{b.sixes}</td>
                        <td>{sr}</td>
                        <td><StatusBadge status={b.status}>{b.status}</StatusBadge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableContainer>
            
            <div style={{ marginBottom: '1rem' }}>
              <strong>Current Bowler:</strong> {currentBowler}
            </div>
          </MobileCard>
          
          <MobileCard darkMode={darkMode}>
            <CardTitle darkMode={darkMode}>Bowler Stats</CardTitle>
            <TableContainer>
              <Table darkMode={darkMode}>
                <thead>
                  <tr>
                    <th>Bowler</th>
                    <th>O</th>
                    <th>R</th>
                    <th>W</th>
                    <th>Econ</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(bowlerStats).map(([name, s]) => {
                    const econ = s.balls > 0 ? (s.runs / (s.balls / 6)).toFixed(2) : "-";
                    return (
                      <tr key={name}>
                        <td>{name}{name === currentBowler ? " (current)" : ""}</td>
                        <td>{formatOvers(s.balls)}</td>
                        <td>{s.runs}</td>
                        <td>{s.wickets}</td>
                        <td>{econ}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableContainer>
            <div style={{ marginTop: '1rem' }}>
              <strong>Overs:</strong> {formatOvers(balls)}
            </div>
            
            {/* Over Details Table */}
            <CardTitle darkMode={darkMode}>Current Over Details</CardTitle>
            <OverDetailsTable darkMode={darkMode}>
              <thead>
                <tr>
                  {currentOverBalls.length === 0 ? (
                    // show 6 placeholders if no deliveries recorded yet for aesthetics
                    Array.from({ length: 6 }).map((_, i) => <th key={i}>{i + 1}</th>)
                  ) : (
                    currentOverBalls.map((_, i) => <th key={i}>{i + 1}</th>)
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {currentOverBalls.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => <td key={i} className="runs-cell">-</td>)
                  ) : (
                    currentOverBalls.map((ball, index) => (
                      <td key={index} className="runs-cell">
                        {ball && ball.text ? ball.text : "-"}
                      </td>
                    ))
                  )}
                </tr>
              </tbody>
            </OverDetailsTable>
          </MobileCard>
        </MobileScorecard>
      </MainContent>

      {/* Milestone Notification */}
      {milestoneNotification && (
        <MilestoneNotification>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {milestoneNotification.type === 'batting' ? '🏏' : '🎯'} {milestoneNotification.milestone}!
          </div>
          <div>
            {milestoneNotification.player}: {milestoneNotification.type === 'batting' ? 
              `${milestoneNotification.runs} runs` : 
              `${milestoneNotification.wickets} wickets`
            }
          </div>
        </MilestoneNotification>
      )}

      {/* Manual Runs Modal */}
      {manualRunsOpen && (
        <Modal>
          <ManualRunsModal darkMode={darkMode}>
            <ManualRunsHeader>
              <h3>Manual Runs</h3>
            </ManualRunsHeader>
            
            <FormRow>
              <FormColumn>
                <Input 
                  type="number" 
                  placeholder="Enter runs" 
                  value={manualRunsValue} 
                  onChange={(e) => setManualRunsValue(e.target.value)}
                  darkMode={darkMode}
                  min="0"
                />
              </FormColumn>
            </FormRow>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button onClick={() => setManualRunsOpen(false)}>Cancel</Button>
              <Button primary onClick={handleManualRunsSubmit}>Submit</Button>
            </div>
          </ManualRunsModal>
        </Modal>
      )}

      {/* Enhanced Wicket Panel */}
      {wicketPanelOpen && (
        <Modal>
          <WicketModal darkMode={darkMode}>
            <WicketHeader>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🏏 Wicket Details</h2>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Record the dismissal details</p>
            </WicketHeader>
            
            <WicketFormSection darkMode={darkMode}>
              <WicketSectionTitle darkMode={darkMode}>Basic Information</WicketSectionTitle>
              <FormRow>
                <FormColumn>
                  <label>Who out (S/N) — informational:</label>
                  <Select value={wicketForm.outName} onChange={(e) => setWicketForm((w) => ({ ...w, outName: e.target.value }))} darkMode={darkMode}>
                    <option value={striker}>{striker}</option>
                    <option value={nonStriker}>{nonStriker}</option>
                  </Select>
                </FormColumn>
                <FormColumn>
                  <label>How out:</label>
                  <Select value={wicketForm.method} onChange={(e) => { 
                    const v = e.target.value; 
                    setWicketForm((w) => ({ ...w, method: v, isRunOut: v === "Run Out" })); 
                  }} darkMode={darkMode}>
                    <option>Bowled</option>
                    <option>Caught</option>
                    <option>Run Out</option>
                    <option>LBW</option>
                    <option>Stumped</option>
                    <option>Hit Wicket</option>
                    <option>Handled the ball</option>
                    <option>Obstructing the field</option>
                    <option>Negative Runs</option> {/* NEW: Negative runs as a wicket-action */}
                  </Select>
                </FormColumn>
              </FormRow>
              
              <FormRow>
                <FormColumn>
                  <label>Who helped (optional):</label>
                  <Input 
                    value={wicketForm.helper} 
                    onChange={(e) => setWicketForm((w) => ({ ...w, helper: capitalizeName(e.target.value) }))} 
                    placeholder="fielder name / catcher etc."
                    darkMode={darkMode}
                  />
                </FormColumn>
              </FormRow>
            </WicketFormSection>
            
            <WicketFormSection darkMode={darkMode}>
              <WicketSectionTitle darkMode={darkMode}>New Batsman</WicketSectionTitle>
              <FormRow>
                <FormColumn>
                  <label>New batsman name (required):</label>
                  <Input 
                    value={wicketForm.newBatsman} 
                    onChange={(e) => setWicketForm((w) => ({ ...w, newBatsman: capitalizeName(e.target.value) }))} 
                    placeholder="Enter new batsman name" 
                    style={{ border: wicketForm.newBatsman ? '1px solid #ced4da' : '1px solid #dc3545' }}
                    darkMode={darkMode}
                  />
                  {!wicketForm.newBatsman && <small style={{ color: '#dc3545' }}>New batsman name is required</small>}
                </FormColumn>
              </FormRow>
            </WicketFormSection>
            
            {wicketForm.isRunOut && (
              <WicketFormSection darkMode={darkMode}>
                <WicketSectionTitle darkMode={darkMode}>Run Out Details</WicketSectionTitle>
                <FormRow>
                  <FormColumn>
                    <label>Which batter got out:</label>
                    <Select value={wicketForm.runOutWhichBatter} onChange={(e) => setWicketForm((w) => ({ ...w, runOutWhichBatter: e.target.value }))} darkMode={darkMode}>
                      <option value="Striker">Striker</option>
                      <option value="Non-Striker">Non-Striker</option>
                    </Select>
                  </FormColumn>
                  <FormColumn>
                    <label>Which end got out:</label>
                    <Select value={wicketForm.runOutEnd} onChange={(e) => setWicketForm((w) => ({ ...w, runOutEnd: e.target.value }))} darkMode={darkMode}>
                      <option>Striker End</option>
                      <option>Non-Striker End</option>
                    </Select>
                  </FormColumn>
                </FormRow>
                
                <FormRow>
                  <FormColumn>
                    <label>Runs scored before run out:</label>
                    <Input 
                      type="number" 
                      value={wicketForm.runsBefore} 
                      onChange={(e) => setWicketForm((w) => ({ ...w, runsBefore: Number(e.target.value) || 0 }))} 
                      min="0"
                      darkMode={darkMode}
                    />
                  </FormColumn>
                </FormRow>
              </WicketFormSection>
            )}
            
            <WicketButtonGroup>
              <WicketCancelButton onClick={() => { setWicketPanelOpen(false); }}>
                Cancel
              </WicketCancelButton>
              <WicketSubmitButton onClick={submitWicketPanel}>
                Record Wicket
              </WicketSubmitButton>
            </WicketButtonGroup>
          </WicketModal>
        </Modal>
      )}

      {/* Bowler Selection Modal */}
      {bowlerSelectionOpen && (
        <Modal>
          <BowlerSelectionModal darkMode={darkMode}>
            <BowlerSelectionHeader>
              <h3>Select Bowler</h3>
            </BowlerSelectionHeader>
            
            <FormRow>
              <FormColumn>
                <Input 
                  placeholder="New bowler name" 
                  value={newBowlerName} 
                  onChange={(e) => setNewBowlerName(capitalizeName(e.target.value))}
                  darkMode={darkMode}
                />
              </FormColumn>
              <FormColumn>
                <Button onClick={addBowler}>Add Bowler</Button>
              </FormColumn>
            </FormRow>
            
            <BowlerList>
              {savedBowlers.map((bowler, index) => (
                <BowlerOption 
                  key={index} 
                  onClick={() => selectBowler(bowler)}
                  selected={currentBowler === bowler}
                  darkMode={darkMode}
                >
                  {bowler}
                </BowlerOption>
              ))}
            </BowlerList>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <Button onClick={() => setBowlerSelectionOpen(false)}>Cancel</Button>
            </div>
          </BowlerSelectionModal>
        </Modal>
      )}

      {/* Start Second Innings Modal */}
      {startSecondOpen && (
        <Modal>
          <ModalContent darkMode={darkMode}>
            <ModalHeader>
              <ModalTitle darkMode={darkMode}>Start Second Innings</ModalTitle>
              <CloseButton onClick={() => setStartSecondOpen(false)}>×</CloseButton>
            </ModalHeader>
            <div style={{ marginBottom: '1rem' }}>
              <div><strong>First innings:</strong> {firstInningsDetail ? `${firstInningsDetail.totalRuns}/${firstInningsDetail.totalWickets} (${formatOvers(firstInningsDetail.balls)}) by ${firstInningsDetail.battingTeam}` : ""}</div>
              <div style={{ marginTop: '0.5rem' }}><strong>Target:</strong> {firstInningsScore !== null ? firstInningsScore + 1 : ""}</div>
            </div>
            <hr />
            
            <FormRow>
              <FormColumn>
                <label>Striker batsman:</label>
                <Input 
                  value={secondStriker} 
                  onChange={(e) => setSecondStriker(capitalizeName(e.target.value))} 
                  placeholder="Striker name"
                  darkMode={darkMode}
                />
              </FormColumn>
              <FormColumn>
                <label>Non-striker batsman:</label>
                <Input 
                  value={secondNonStriker} 
                  onChange={(e) => setSecondNonStriker(capitalizeName(e.target.value))} 
                  placeholder="Non-striker name"
                  darkMode={darkMode}
                />
              </FormColumn>
            </FormRow>
            
            <FormRow>
              <FormColumn>
                <label>Bowler:</label>
                <Input 
                  value={secondBowler} 
                  onChange={(e) => setSecondBowler(capitalizeName(e.target.value))} 
                  placeholder="Bowler name"
                  darkMode={darkMode}
                />
              </FormColumn>
            </FormRow>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button onClick={() => setStartSecondOpen(false)}>Cancel</Button>
              <Button primary onClick={startSecondInnings}>Start Second Innings</Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Final Summary Modal */}
      {finalModalOpen && secondInningsDetail && (
        <Modal>
          <ModalContent style={{ maxWidth: '900px' }} darkMode={darkMode}>
            <ModalHeader>
              <ModalTitle darkMode={darkMode}>Final Scorecard</ModalTitle>
              <CloseButton onClick={() => setFinalModalOpen(false)}>×</CloseButton>
            </ModalHeader>
            <div id="final-scorecard">
              <div style={{ marginBottom: '1rem' }}>
                <strong>{team1} vs {team2}</strong>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <Card style={{ flex: '1', minWidth: '300px' }} darkMode={darkMode}>
                  <CardTitle darkMode={darkMode}>First Innings — {firstInningsDetail ? firstInningsDetail.battingTeam : ""}</CardTitle>
                  {firstInningsDetail ? (
                    <>
                      <div><strong>Score:</strong> {firstInningsDetail.totalRuns}/{firstInningsDetail.totalWickets} ({formatOvers(firstInningsDetail.balls)})</div>
                      <Table darkMode={darkMode}>
                        <thead>
                          <tr>
                            <th>Batsman</th>
                            <th>R</th>
                            <th>B</th>
                            <th>4s</th>
                            <th>6s</th>
                            <th>SR</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(firstInningsDetail.batsmen || {}).map((b) => {
                            const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-";
                            return (
                              <tr key={b.name}>
                                <td>{b.name}</td>
                                <td>{b.runs}</td>
                                <td>{b.balls}</td>
                                <td>{b.fours}</td>
                                <td>{b.sixes}</td>
                                <td>{sr}</td>
                                <td>{b.status}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Extras:</strong> {firstInningsDetail.extrasBreakdown ? 
                          Object.values(firstInningsDetail.extrasBreakdown).reduce((sum, val) => sum + val, 0) : 
                          (firstInningsDetail.extras || 0)}
                      </div>
                      {firstInningsDetail.extrasBreakdown && (
                        <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                          (Wide: {firstInningsDetail.extrasBreakdown.wides}, No Ball: {firstInningsDetail.extrasBreakdown.noBalls}, 
                          Bye: {firstInningsDetail.extrasBreakdown.byes}, Leg Bye: {firstInningsDetail.extrasBreakdown.legByes}, 
                          Negative: {firstInningsDetail.extrasBreakdown.negative})
                        </div>
                      )}

                      <div style={{ marginTop: '1rem' }}>
                        <h4>Bowling</h4>
                        <Table darkMode={darkMode}>
                          <thead>
                            <tr>
                              <th>Bowler</th>
                              <th>O</th>
                              <th>R</th>
                              <th>W</th>
                              <th>Econ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(firstInningsDetail.bowlerStats || {}).map(([name, s]) => {
                              const econ = s.balls > 0 ? (s.runs / (s.balls / 6)).toFixed(2) : "-";
                              return (
                                <tr key={name}>
                                  <td>{name}</td>
                                  <td>{formatOvers(s.balls)}</td>
                                  <td>{s.runs}</td>
                                  <td>{s.wickets}</td>
                                  <td>{econ}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    </>
                  ) : <div>No data</div>}
                </Card>

                <Card style={{ flex: '1', minWidth: '300px' }} darkMode={darkMode}>
                  <CardTitle darkMode={darkMode}>Second Innings — {secondInningsDetail.battingTeam}</CardTitle>
                  <div><strong>Score:</strong> {secondInningsDetail.totalRuns}/{secondInningsDetail.totalWickets} ({formatOvers(secondInningsDetail.balls)})</div>
                  <Table darkMode={darkMode}>
                    <thead>
                      <tr>
                        <th>Batsman</th>
                        <th>R</th>
                        <th>B</th>
                        <th>4s</th>
                        <th>6s</th>
                        <th>SR</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(secondInningsDetail.batsmen || {}).map((b) => {
                        const sr = b.balls > 0 ? ((b.runs / b.balls ) * 100).toFixed(1) : "-";
                        return (
                          <tr key={b.name}>
                            <td>{b.name}</td>
                            <td>{b.runs}</td>
                            <td>{b.balls}</td>
                            <td>{b.fours}</td>
                            <td>{b.sixes}</td>
                            <td>{sr}</td>
                            <td>{b.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Extras:</strong> {secondInningsDetail.extrasBreakdown ? 
                      Object.values(secondInningsDetail.extrasBreakdown).reduce((sum, val) => sum + val, 0) : 
                      (secondInningsDetail.extras || 0)}
                  </div>
                  {secondInningsDetail.extrasBreakdown && (
                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      (Wide: {secondInningsDetail.extrasBreakdown.wides}, No Ball: {secondInningsDetail.extrasBreakdown.noBalls}, 
                      Bye: {secondInningsDetail.extrasBreakdown.byes}, Leg Bye: {secondInningsDetail.extrasBreakdown.legByes}, 
                      Negative: {secondInningsDetail.extrasBreakdown.negative})
                    </div>
                  )}

                  <div style={{ marginTop: '1rem' }}>
                    <h4>Bowling</h4>
                    <Table darkMode={darkMode}>
                      <thead>
                        <tr>
                          <th>Bowler</th>
                          <th>O</th>
                          <th>R</th>
                          <th>W</th>
                          <th>Econ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(secondInningsDetail.bowlerStats || {}).map(([name, s]) => {
                          const econ = s.balls > 0 ? (s.runs / (s.balls / 6)).toFixed(2) : "-";
                          return (
                            <tr key={name}>
                              <td>{name}</td>
                              <td>{formatOvers(s.balls)}</td>
                              <td>{s.runs}</td>
                              <td>{s.wickets}</td>
                              <td>{econ}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </Card>
              </div>

              <Card style={{ marginTop: '1rem' }} darkMode={darkMode}>
                <CardTitle darkMode={darkMode}>Result</CardTitle>
                <h3>{secondInningsDetail.resultText}</h3>
              </Card>
            </div>
                      
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
              <Button onClick={() => { setFinalModalOpen(false); setPage("setup"); }}>Return Home</Button>
              <Button primary onClick={downloadFinalPDFAndExit}>Download PDF & Return</Button>
            </div>
          </ModalContent>
        </Modal>
      )}
    </AppContainer>
  );
}
