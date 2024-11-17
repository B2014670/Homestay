import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { InputNumber, DatePicker, Typography, Card, Tag } from 'antd';
import { CoffeeOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const BREAKFAST_PRICE_PER_PERSON = 150000; // 150,000 VND per person

function BreakfastBooking({ onBookingChange, loaiRoom, selectedDateRange }) {
  const [guests, setGuests] = useState(1);
  const [dates, setDates] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  const maxGuests = loaiRoom === "3-4 người" ? 4 : 2;

  useEffect(() => {
    calculateTotalCost();
  }, [guests, dates]);

  const calculateTotalCost = () => {
    const cost = guests * BREAKFAST_PRICE_PER_PERSON * dates.length;
    setTotalCost(cost);
    if (dates.length > 0) {
      onBookingChange({ 
        serviceType: "Bửa sáng",        
        guests, 
        dates, 
        pricePerUnit: 
        BREAKFAST_PRICE_PER_PERSON, 
        totalServiceCost: cost 
      });
    }
  };

  const handleGuestsChange = (value) => {
    setGuests(value || 1);
  };

  const handleDateChange = (dates, dateStrings) => {
    setDates(dateStrings);
    calculateTotalCost();
  };

  const disabledDate = (current) => {
    // Disable dates outside of the selected range from the parent
    if (!selectedDateRange[0] || !selectedDateRange[1]) {
      return false;
    }
    return current.isBefore(selectedDateRange[0], 'day') || current.isSame(selectedDateRange[0], 'day') || current.isAfter(selectedDateRange[1], 'day');
  };

  return (
    <Card className="w-full mb-4 bg-white shadow-sm rounded-lg">
      <div className="space-y-4">
        <div>
          <Text strong>Số lượng khách</Text>
          <InputNumber
            min={1}
            max={maxGuests}
            value={guests}
            onChange={handleGuestsChange}
            className="w-full"
            prefix={<UserOutlined className="text-gray-400" />}
          />
        </div>

        <div>
          <Text strong>Ngày</Text>
          <DatePicker
            className="w-full"
            format="DD/MM/YYYY"
            onChange={handleDateChange}
            placeholder="Chọn ngày"
            multiple
            disabledDate={disabledDate}
          />
        </div>

        <Text className="block text-sm text-gray-500">
          (Giá bữa sáng: {BREAKFAST_PRICE_PER_PERSON.toLocaleString()} VND/người)
        </Text>

        <div className="flex justify-between items-center">
          <Text strong>Tổng cộng :</Text>
          <Text strong className="text-lg">{totalCost.toLocaleString()} VND</Text>
        </div>
        
        {dates.length > 0 && (
          <div className="mt-2">
            <Text strong>Ngày đã chọn:</Text>
            <div className="flex flex-wrap gap-1 mt-1">
              {dates.map((date, index) => (
                <Tag key={index} color="blue">{date}</Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

BreakfastBooking.propTypes = {
  onBookingChange: PropTypes.func.isRequired,
  // loaiRoom: PropTypes.string.isRequired,
  selectedDateRange: PropTypes.array.isRequired,
};

export default BreakfastBooking;
