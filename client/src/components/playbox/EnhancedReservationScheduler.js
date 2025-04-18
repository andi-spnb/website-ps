import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react';

const EnhancedReservationScheduler = ({
  availableTimeSlots = [],
  onDateChange,
  onTimeSelect,
  onDurationChange,
  selectedDate,
  selectedTime,
  selectedDuration,
  isFixedTimePackage = false, 
  fixedStartTime = null,
  fixedEndTime = null
}) => {
  const [calendarView, setCalendarView] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [validDurations, setValidDurations] = useState([]);
  const [showReturnTimeInfo, setShowReturnTimeInfo] = useState(false);

  // Durasi yang tersedia (dalam jam)
  const durationOptions = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24];
  
  // Jam operasional
  const CLOSE_HOUR = 0; // Tutup jam 12 malam (0)
  const MIN_DURATION = 3; // Durasi minimum 3 jam
  const NO_RETURN_END = 7; // Tidak boleh kembali sampai jam 06:59 (sebelum jam 07:00)
  
  // Menghitung durasi valid setiap kali jam mulai berubah
  useEffect(() => {
    console.log("EnhancedReservationScheduler render with props:");
    console.log("isFixedTimePackage:", isFixedTimePackage);
    console.log("fixedStartTime:", fixedStartTime);
    console.log("fixedEndTime:", fixedEndTime);
    console.log("selectedTime:", selectedTime);
    console.log("selectedDuration:", selectedDuration);
  }, [isFixedTimePackage, fixedStartTime, fixedEndTime, selectedTime, selectedDuration]);
  
  useEffect(() => {
    if (!selectedTime || isFixedTimePackage) {
      setValidDurations([]);
      return;
    }
    
    const startHour = parseInt(selectedTime.split(':')[0]);
    calculateValidDurations(startHour);
  }, [selectedTime, isFixedTimePackage]);
  
  // Menghitung durasi yang valid berdasarkan jam mulai
  const calculateValidDurations = (startHour) => {
    // Durasi maksimum sebelum tutup toko (hours until midnight)
    let maxDurationBeforeClose;
    if (startHour > CLOSE_HOUR) {
      // Jika mulai setelah tengah malam (misal jam 22), maka: 24 - 22 = 2 jam sampai tengah malam
      maxDurationBeforeClose = 24 - startHour + CLOSE_HOUR;
    } else {
      // Jika mulai sebelum tengah malam, misal jam 14, maka: 0 - 14 = -14, tapi kita tambah 24 menjadi 10 jam
      maxDurationBeforeClose = CLOSE_HOUR - startHour;
      if (maxDurationBeforeClose < 0) maxDurationBeforeClose += 24;
    }
    
    // Durasi minimum agar pengembalian terjadi pada/setelah jam buka pagi
    // Misal, jam mulai 22:00, minimal kembali jam 07:00 = (7 - 22) + 24 = 9 jam
    let minDurationForMorning = (NO_RETURN_END - startHour);
    if (minDurationForMorning <= 0) minDurationForMorning += 24;
    
    // Validasi setiap opsi durasi
    const valid = durationOptions.filter(duration => {
      // Durasi minimal 3 jam
      if (duration < MIN_DURATION) return false;
      
      // Valid jika selesai sebelum tutup
      if (duration <= maxDurationBeforeClose) return true;
      
      // Valid jika selesai pagi pada/setelah jam buka
      if (duration >= minDurationForMorning) return true;
      
      // Tidak valid jika jatuh di periode toko tutup
      return false;
    });
    
    setValidDurations(valid);
    
    // Auto-set durasi jika belum dipilih atau tidak valid
    if (!selectedDuration || !valid.includes(selectedDuration)) {
      if (valid.length > 0) {
        // Pilih durasi valid terdekat dengan durasi yang dipilih sebelumnya
        if (selectedDuration) {
          const closest = valid.reduce((prev, curr) => 
            Math.abs(curr - selectedDuration) < Math.abs(prev - selectedDuration) ? curr : prev
          );
          onDurationChange(closest);
        } else {
          onDurationChange(valid[0]); // Default ke durasi valid pertama
        }
      }
    }
  };
  
  const formatTime = (hour) => {
    return `${String(hour).padStart(2, '0')}:00`;
  };
  // Calculate end time based on selected time and duration
  const getEndTime = () => {
    if (!selectedTime || !selectedDuration) return null;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours + selectedDuration);
    endDate.setMinutes(minutes);
    
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };
  
  // Menentukan apakah pengembalian akan terjadi di pagi hari berikutnya
  const isNextDayReturn = () => {
    if (!selectedTime || !selectedDuration) return false;
    
    const startHour = parseInt(selectedTime.split(':')[0]);
    const endHour = (startHour + selectedDuration) % 24;
    
    // Jika durasi > 24 jam atau jika jam akhir berada di pagi hari (7-12)
    return selectedDuration >= 24 || (endHour >= 7 && endHour < 12 && startHour + selectedDuration > 24);
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };
  
  // Render the days of the week header
  const renderDaysOfWeek = () => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map(day => (
          <div key={day} className="text-center text-sm text-gray-400 font-medium">
            {day}
          </div>
        ))}
      </div>
    );
  };
  
  // Helper function to create dates with fixed timezone issues
  const createLocalDate = (year, month, day) => {
    // Buat tanggal dengan waktu tengah hari untuk menghindari masalah zona waktu
    const date = new Date(year, month, day, 12, 0, 0);
    return date;
  };
  
  // Helper function to get date string in YYYY-MM-DD format
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  
  // Render the days of the month
  const renderDaysOfMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get the first day of the month (using improved method)
    const firstDay = createLocalDate(year, month, 1);
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Create an array to hold all days to display
    const daysArray = [];
    
    // Determine first day of week (Sunday is 0 in JavaScript)
    // We want to start with Monday (1) so we need to adjust
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Convert Sunday from 0 to 7
    firstDayOfWeek -= 1; // Adjust so Monday is 0
    
    // Add days from previous month to fill first week
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevYear, month, 0).getDate();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = prevMonthLastDay - firstDayOfWeek + i + 1;
      const date = createLocalDate(prevYear, prevMonth, day);
      daysArray.push({
        date,
        currentMonth: false,
        disabled: true
      });
    }
    
    // Add days from current month
    const today = new Date();
    const todayDateString = formatDateString(today);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = createLocalDate(year, month, day);
      const dateString = formatDateString(date);
      
      const isToday = dateString === todayDateString;
      const isSelected = dateString === selectedDate;
      const isPast = date < today && dateString !== todayDateString;
      
      daysArray.push({
        date,
        dateString,
        currentMonth: true,
        isToday,
        isSelected,
        disabled: isPast
      });
    }
    
    // Calculate how many days we need from the next month
    const remainingDays = 42 - daysArray.length; // 6 rows of 7 days
    
    // Add days from next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let day = 1; day <= remainingDays; day++) {
      const date = createLocalDate(nextYear, nextMonth, day);
      daysArray.push({
        date,
        dateString: formatDateString(date),
        currentMonth: false,
        disabled: true
      });
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((day, index) => {
          // Determine if the day is a weekend
          const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
          
          let dayClasses = "relative rounded-full flex flex-col items-center justify-center ";
          if (day.isSelected) {
            dayClasses += "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold transform scale-110 shadow-lg z-10 w-10 h-10 ";
          } else if (!day.currentMonth) {
            dayClasses += "text-gray-600 opacity-40 w-10 h-10 ";
          } else if (day.disabled) {
            dayClasses += "text-gray-500 cursor-not-allowed w-10 h-10 ";
          } else if (day.isToday) {
            dayClasses += "border-2 border-blue-500 text-blue-400 hover:bg-blue-900 hover:bg-opacity-20 cursor-pointer w-10 h-10 ";
          } else if (isWeekend) {
            dayClasses += "border border-indigo-500 bg-indigo-900 bg-opacity-10 text-indigo-400 hover:bg-opacity-20 cursor-pointer w-10 h-10 ";
          } else {
            dayClasses += "border border-gray-700 bg-gray-800 hover:bg-gray-700 cursor-pointer w-10 h-10 ";
          }
          
          return (
            <div key={index} className="flex items-center justify-center p-0.5">
              <div 
                className={dayClasses}
                onClick={() => {
                  if (!day.disabled && day.currentMonth) {
                    // Gunakan dateString yang sudah disiapkan
                    console.log("Memilih tanggal:", day.dateString);
                    onDateChange(day.dateString);
                    setCalendarView(false);
                  }
                }}
              >
                {day.date.getDate()}
                {day.isToday && <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (time) => {
    // Cek dengan sangat eksplisit bahwa ini bukan paket waktu tetap
    if (isFixedTimePackage === true) {
      console.log("Cannot select time for fixed package");
      return; // Keluar dari fungsi tanpa melakukan apa-apa
    }
    
    // Hanya lanjutkan jika bukan paket tetap
    onTimeSelect(time);
    console.log("Selected time:", time);
  };
  
  return (
    <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 border border-gray-700 shadow-lg">
      {/* Date selection - selalu ditampilkan */}
      <div className="mb-6">
        <label className="block text-gray-300 mb-2 font-medium">Tanggal Reservasi</label>
        <div className="relative">
          <input
            type="text"
            value={selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            onClick={() => setCalendarView(!calendarView)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pl-10 cursor-pointer hover:border-blue-500 shadow-sm transition-colors"
            placeholder="Pilih tanggal reservasi"
            readOnly
          />
          <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* Calendar view */}
      {calendarView && (
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-5 mb-6 border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-bold text-lg">
              {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {renderDaysOfWeek()}
          {renderDaysOfMonth()}
          
          <div className="mt-4 text-xs text-gray-400 flex justify-center">
            <div className="flex items-center mx-2">
              <div className="w-3 h-3 border border-indigo-500 bg-indigo-900 bg-opacity-10 rounded-sm mr-1"></div>
              <span>Akhir Pekan</span>
            </div>
            <div className="flex items-center mx-2">
              <div className="w-3 h-3 border-2 border-blue-500 rounded-sm mr-1"></div>
              <span>Hari Ini</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Paket Tetap - tampilkan informasi paket */}
      {isFixedTimePackage && fixedStartTime && selectedDate && (
        <div className="mb-6">
          <div className="bg-yellow-900 bg-opacity-20 rounded-lg p-4 border border-yellow-700 mb-4">
            <h3 className="font-semibold text-yellow-400 flex items-center mb-2">
              <Clock size={18} className="mr-2" />
              Informasi Paket Waktu Tetap
            </h3>
            <p className="text-sm text-yellow-300">
              Anda telah memilih paket dengan waktu tetap. Jam mulai dan durasi sewa sudah ditentukan sesuai dengan paket yang dipilih dan <strong>tidak dapat diubah</strong>.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-900 to-amber-900 rounded-lg p-4 border border-yellow-600 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-sm text-yellow-300 mb-1">Jam Mulai</div>
                <div className="text-2xl font-bold text-white">{fixedStartTime}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-yellow-300 mb-1">Jam Selesai</div>
                <div className="text-2xl font-bold text-white">{fixedEndTime || getEndTime()}</div>
              </div>
              <div className="text-center col-span-2 mt-2">
                <div className="text-sm text-yellow-300 mb-1">Durasi Sewa</div>
                <div className="text-xl font-bold text-white">{selectedDuration} Jam</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Time slot selection - Tampilkan hanya jika BUKAN paket tetap */}
      {selectedDate && !isFixedTimePackage && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-gray-300 font-medium">Jam Mulai</label>
            <div className="text-xs px-3 py-1 bg-blue-900 bg-opacity-30 rounded-full text-blue-300 border border-blue-600">
              Operasional: 08:00 - 00:00
            </div>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4">

          {availableTimeSlots.map(slot => {
  const hour = slot.hour;
  const timeString = formatTime(hour);
  
  // Tentukan apakah slot ini disabled
  const isDisabled = !slot.available;
  
  // Tambahkan penanda visual untuk paket tetap
  const isFixedPackageSlot = slot.isFixedPackage;
  
  // Style conditionals dengan tambahan untuk paket tetap
  let bgGradient = "from-gray-800 to-gray-700"; // Default
  
  if (isFixedPackageSlot) {
    bgGradient = "from-purple-900 to-pink-900"; // Warna khusus untuk slot paket tetap
  } else if (hour >= 8 && hour < 12) {
    bgGradient = "from-blue-900 to-indigo-900"; // Morning
  } else if (hour >= 12 && hour < 17) {
    bgGradient = "from-indigo-900 to-purple-900"; // Afternoon
  } else if (hour >= 17 && hour < 20) {
    bgGradient = "from-purple-900 to-pink-900"; // Evening
  } else if (hour >= 20) {
    bgGradient = "from-pink-900 to-red-900"; // Night
  }
  
  // Selected state
  if (selectedTime === timeString) {
    bgGradient = "from-blue-600 to-blue-500";
  }
  
  return (
    <button
      key={slot.hour}
      type="button"
      onClick={() => !isDisabled && handleTimeSlotSelect(timeString)}
      className={`py-3 text-center rounded-lg border ${
        isDisabled
        ? `bg-${isFixedPackageSlot ? 'purple' : 'gray'}-800 border-${isFixedPackageSlot ? 'purple' : 'gray'}-700 opacity-50 text-${isFixedPackageSlot ? 'purple' : 'gray'}-500 cursor-not-allowed` 
        : selectedTime === timeString
            ? 'bg-gradient-to-br border-blue-400 text-white font-medium shadow-lg transform scale-105'
            : `bg-gradient-to-br ${bgGradient} border-gray-600 hover:border-blue-500`
      }`}
      disabled={isDisabled}
    >
      <div className="text-lg">{timeString}</div>
      {isFixedPackageSlot && isDisabled && (
        <div className="text-xs text-purple-400">Paket Tetap</div>
      )}
    </button>
  );
})}
          </div>
        </div>
      )}
      
      {/* Return time info notice - selalu ditampilkan jika ada waktu */}
      {(selectedTime || (isFixedTimePackage && fixedStartTime)) && (
        <div className="mb-6">
          <button 
            onClick={() => setShowReturnTimeInfo(!showReturnTimeInfo)} 
            className="text-blue-400 text-sm flex items-center mb-2 hover:text-blue-300"
          >
            <Info size={14} className="mr-1" />
            <span>Info waktu pengembalian</span>
          </button>
          
          {showReturnTimeInfo && (
            <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-lg p-3 text-sm text-blue-300 mb-4">
              <p>Pengembalian Playbox tidak dapat dilakukan antara jam 00:00 - 07:00 pagi.</p>
              <p className="mt-1">Jika waktu sewa Anda melebihi jam 00:00, maka pengembalian Playbox akan dilakukan pada jam 07:00 pagi atau setelahnya.</p>
            </div>
          )}
        </div>
      )}
      
      {/* Duration selection - Tampilkan hanya jika BUKAN paket tetap */}
      {selectedTime && !isFixedTimePackage && (
        <div className="mb-6">
          <label className="block text-gray-300 mb-3 font-medium">Durasi Sewa</label>
          
          <div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {durationOptions.map(hours => {
                const isValid = validDurations.includes(hours);
                const isNextDay = (parseInt(selectedTime?.split(':')[0]) + hours) >= 24;
                
                // Disable durations yang tidak valid
                const isDisabled = !isValid;
                
                return (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => !isDisabled && onDurationChange(hours)}
                    className={`relative py-3 text-center rounded-lg ${
                      isDisabled
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : selectedDuration === hours
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg'
                          : isNextDay 
                            ? 'bg-gradient-to-r from-purple-900 to-indigo-900 border border-indigo-600'
                            : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                    }`}
                    disabled={isDisabled}
                  >
                    {hours === 24 ? '1 Hari' : `${hours} Jam`}
                    
                    {isValid && isNextDay && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">
                        +
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Legend for duration colors */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-700 rounded-sm mr-1"></div>
                <span>Hari yang sama</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-sm mr-1"></div>
                <span>Sampai besok</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-800 rounded-sm mr-1"></div>
                <span>Tidak tersedia</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected time summary - selalu ditampilkan */}
      {selectedDate && ((selectedTime && selectedDuration) || (isFixedTimePackage && fixedStartTime)) && (
        <div className={`rounded-lg p-5 shadow-lg border ${
          isFixedTimePackage 
          ? 'bg-gradient-to-r from-yellow-800 to-amber-800 border-yellow-600' 
          : 'bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-700'
        }`}>
          <div className="flex items-start">
            <div className={`p-3 rounded-lg mr-4 shadow-inner ${
              isFixedTimePackage ? 'bg-yellow-700 bg-opacity-50' : 'bg-blue-800 bg-opacity-50'
            }`}>
              <Clock size={24} className={isFixedTimePackage ? 'text-yellow-300' : 'text-blue-300'} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1">Jadwal Reservasi</h3>
              <div className={isFixedTimePackage ? 'text-yellow-100' : 'text-blue-100'}>
                {selectedDate ? new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {isFixedTimePackage ? fixedStartTime : selectedTime} - {fixedEndTime || getEndTime()} 
                <span className={`ml-2 text-lg ${isFixedTimePackage ? 'text-yellow-200' : 'text-blue-200'}`}>
                  ({selectedDuration} jam)
                </span>
              </div>
              {isNextDayReturn() && (
                <div className="text-xs bg-indigo-800 inline-block px-2 py-1 rounded mt-2 text-indigo-200">
                  Pengembalian besok pagi
                </div>
              )}
              {isFixedTimePackage && (
                <div className="text-xs bg-yellow-700 inline-block px-2 py-1 rounded mt-2 ml-2 text-yellow-200">
                  Paket Waktu Tetap
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedReservationScheduler;