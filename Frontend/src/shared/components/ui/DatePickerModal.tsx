import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/core/theme/ThemeContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate?: Date;
  currentStartDate?: Date;
  currentRecurring?: string;
  currentReminder?: string;
  currentSelectedDays?: string[];
  onSave: (date: Date, recurring: string, reminder: string, startDate?: Date, selectedDays?: string[]) => void;
  onRemove?: () => void;
}

export function DatePickerModal({
  isOpen,
  onClose,
  currentDate,
  currentStartDate,
  currentRecurring,
  currentReminder,
  currentSelectedDays,
  onSave,
  onRemove
}: DatePickerModalProps) {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(currentDate ? new Date(currentDate) : new Date());
  const [startDate, setStartDate] = useState<Date | null>(currentStartDate || null);
  const [useStartDate, setUseStartDate] = useState(!!currentStartDate);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [time, setTime] = useState('10:24');
  const [recurring, setRecurring] = useState(currentRecurring || 'Never');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [reminder, setReminder] = useState(currentReminder || 'None');
  const initializedRef = useRef(false);

  const bgMain = theme === 'dark' ? 'bg-[#0E0E1F]' : 'bg-gray-50';
  const bgCard = theme === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white';
  const bgPanel = theme === 'dark' ? 'bg-[#252540]' : 'bg-gray-100';
  const textPrimary = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondary = theme === 'dark' ? 'text-[#CFCFE8]' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-white/5' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  useEffect(() => {
    if (isOpen) {
      if (!initializedRef.current) {
        // Initialize with current values when modal opens (only once)
        initializedRef.current = true;
    if (currentDate) {
          const dateObj = new Date(currentDate);
          setSelectedDate(dateObj);
          setCurrentMonth(dateObj.getMonth());
          setCurrentYear(dateObj.getFullYear());
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          const minutesStr = dateObj.getMinutes().toString().padStart(2, '0');
          setTime(`${hours}:${minutesStr}`);
        }
        setStartDate(currentStartDate ? new Date(currentStartDate) : null);
        setUseStartDate(!!currentStartDate);
        setRecurring(currentRecurring || 'Never');
        setReminder(currentReminder || 'None');
        setSelectedDays(currentSelectedDays || []);
      }
      // Update selectedDays if currentSelectedDays changes (for reopening modal with existing data)
      if (initializedRef.current && currentSelectedDays && currentSelectedDays.length > 0 && selectedDays.length === 0) {
        setSelectedDays(currentSelectedDays);
      }
    } else if (!isOpen) {
      // Reset initialization flag when modal closes
      initializedRef.current = false;
    }
  }, [isOpen, currentDate, currentStartDate, currentRecurring, currentReminder, currentSelectedDays, selectedDays]);

  if (!isOpen) return null;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const recurringOptions = [
    'Never',
    'Daily',
    'Monday to Friday',
    'Weekly',
    `Monthly on the ${selectedDate.getDate()}${getOrdinalSuffix(selectedDate.getDate())}`,
    `Monthly on the ${getWeekOfMonth(selectedDate)} ${getDayName(selectedDate)}`
  ];

  const reminderOptions = [
    'None',
    'At time of due date',
    '5 minutes before',
    '10 minutes before',
    '15 minutes before',
    '1 hour before',
    '2 hours before',
    '1 day before',
    '2 days before'
  ];

  function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  function getWeekOfMonth(date: Date): string {
    const day = date.getDate();
    const weekNum = Math.ceil(day / 7);
    const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th'];
    return ordinals[weekNum] || `${weekNum}th`;
  }

  function getDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const previousYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const nextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const selectDate = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    // Auto-set start date to selected date when clicked
    if (!useStartDate) {
      setStartDate(newDate);
    }
  };

  const toggleWeekDay = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
    } else {
        return [...prev, day];
    }
    });
  };

  const handleSave = () => {
    const [hours, minutes] = time.split(':');
    const finalDate = new Date(selectedDate);
    finalDate.setHours(parseInt(hours), parseInt(minutes));
    onSave(finalDate, recurring, reminder, useStartDate ? startDate || undefined : undefined, selectedDays);
    onClose();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    onClose();
  };

  const renderCalendar = () => {
    const days = [];
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    
    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <button
          key={`prev-${i}`}
          className={`p-2 text-center ${textSecondary} opacity-40 text-sm`}
          disabled
        >
          {prevMonthDays - i}
        </button>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentMonth && 
                        selectedDate.getFullYear() === currentYear;
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentMonth && 
                     new Date().getFullYear() === currentYear;

      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          className={`p-2 text-center rounded transition-colors text-sm ${
            isSelected 
              ? 'bg-blue-500 text-white' 
              : isToday
              ? `${textPrimary} border ${borderColor}`
              : `${textPrimary} ${hoverBg}`
          }`}
        >
          {day}
        </button>
      );
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <button
          key={`next-${day}`}
          className={`p-2 text-center ${textSecondary} opacity-40 text-sm`}
          disabled
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div 
        className={`${bgCard} rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto border ${borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 border-b ${borderColor} flex items-center justify-between sticky top-0 ${bgCard} z-10`}>
          <h2 className={`${textPrimary}`}>Dates</h2>
          <button onClick={onClose} className={`p-1 rounded ${hoverBg}`}>
            <X className={`w-5 h-5 ${textSecondary}`} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={previousYear} className={`p-1 rounded ${hoverBg}`} title="Previous Year">
              <ChevronLeft className={`w-5 h-5 ${textSecondary}`} />
            </button>
            <button onClick={previousMonth} className={`p-1 rounded ${hoverBg}`} title="Previous Month">
              <ChevronLeft className={`w-4 h-4 ${textSecondary}`} />
            </button>
            <span className={`${textPrimary} min-w-[140px] text-center`}>{monthNames[currentMonth]} {currentYear}</span>
            <button onClick={nextMonth} className={`p-1 rounded ${hoverBg}`} title="Next Month">
              <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
            </button>
            <button onClick={nextYear} className={`p-1 rounded ${hoverBg}`} title="Next Year">
              <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
            </button>
          </div>

          {/* Calendar */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map(day => (
              <div key={day} className={`p-2 text-center text-xs ${textSecondary}`}>
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>

          {/* Start Date */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={useStartDate}
                onChange={(e) => setUseStartDate(e.target.checked)}
                className="rounded"
              />
              <label className={`text-sm ${textSecondary}`}>Start date</label>
            </div>
            <input
              type="date"
              value={startDate ? startDate.toISOString().split('T')[0] : selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              disabled={!useStartDate}
              className={`w-full px-3 py-2.5 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none ${!useStartDate ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="dd/mm/yyyy"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>Due date</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className={`w-40 px-3 py-2.5 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none`}
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`flex-1 px-3 py-2.5 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none`}
              />
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>
              Recurring
            </label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none`}
            >
              {recurringOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Weekly Day Selection */}
          {recurring === 'Weekly' && (
            <div>
              <label className={`block text-sm ${textSecondary} mb-2`}>Select days</label>
              <div className="flex gap-2 justify-between">
                {weekDays.map((day, index) => (
                  <button
                    key={`weekday-${index}-${day}`}
                    onClick={() => toggleWeekDay(day)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-colors ${
                      selectedDays.includes(day)
                        ? 'bg-blue-500 text-white'
                        : `${bgPanel} ${textPrimary} ${hoverBg}`
                    }`}
                  >
                    {weekDayLabels[index]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reminder */}
          <div>
            <label className={`block text-sm ${textSecondary} mb-2`}>Set due date reminder</label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-lg border ${borderColor} ${bgMain} ${textPrimary} outline-none`}
            >
              {reminderOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <p className={`text-xs ${textSecondary} mt-2`}>
              Reminders will be sent to all members
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00C6FF] to-[#9D50BB] text-white hover:shadow-lg hover:shadow-[#00C6FF]/50 transition-all text-center"
            >
              Save
            </button>
            {onRemove && (
              <button
                onClick={handleRemove}
                className={`flex-1 px-6 py-3 rounded-lg border ${borderColor} ${textPrimary} ${hoverBg} text-center`}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
