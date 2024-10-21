import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import { CloudOutlined, EnvironmentOutlined, ClockCircleOutlined, SunOutlined } from '@ant-design/icons';
import { IoRainyOutline } from "react-icons/io5";

const { Title, Text } = Typography;

const WeatherDisplay = ({ weatherData }) => {
  // Default data if no weatherData is passed
  if (!weatherData) {
    return <p>Đang tải thông tin thời tiết...</p>;
  }

  const getWeatherIcon = (weatherText = 'rain') => {
    switch (weatherText.toLowerCase()) {
      case 'cloudy':
      case 'mostly cloudy':      
        return <CloudOutlined style={{ fontSize: 48, color: '#1890ff' }} />;
      case 'sunny':
      case 'mostly sunny':
      case 'partly sunny':
        return <SunOutlined style={{ fontSize: 48, color: '#ffcc00' }} />;
      case 'rain':
      case 'showers':
      case 'sleet':
      case 't-storms':
      case 'rain and snow':
        return <IoRainyOutline style={{ fontSize: 48, color: '#007bff' }}/>
      default:
        return <CloudOutlined style={{ fontSize: 48, color: '#1890ff' }} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 400,
        margin: '0 auto',
        borderRadius: 8,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <EnvironmentOutlined /> Lại Sơn, Kiên Giang
            </Title>
          </Col>
          <Col>{getWeatherIcon(weatherData.WeatherText)}</Col>
        </Row>

        <Row align="middle" justify="center">
          <Col>
            <Title style={{ fontSize: 48, margin: 0 }}>
              {weatherData.Temperature.Metric.Value.toFixed(1)}°C
            </Title>
          </Col>
        </Row>

        <Row justify="center">
          <Col>
            <Text strong style={{ fontSize: 18 }}>{weatherData.WeatherText}</Text>
          </Col>
        </Row>

        <Row justify="space-between">
          <Col>
            <Text>Độ F: {weatherData.Temperature.Imperial.Value.toFixed(1)}°F</Text>
          </Col>
          <Col>
            <Text>Buổi: {weatherData.IsDayTime ? 'Ngày' : 'Đêm'}</Text>
          </Col>
        </Row>

        <Row justify="center">
          <Col>
            <Text type="secondary">
              <ClockCircleOutlined /> {formatDate(weatherData.LocalObservationDateTime)}
            </Text>
          </Col>
        </Row>

        <Row justify="center">
          <Col>
            <a href={weatherData.Link} target="_blank" rel="noopener noreferrer">
              Xem chi tiết trên AccuWeather
            </a>
          </Col>
        </Row>
      </Space>
    </Card>
  );
}

export default WeatherDisplay;
