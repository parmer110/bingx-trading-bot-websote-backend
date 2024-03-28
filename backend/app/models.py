from app.database import Base
from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True)
    last_otp_code = Column(String, default=None)
    last_otp_expiration = Column(Integer, default=None)
    capital_usdt = Column(Float, default=None)
    positions = relationship("Position", back_populates="owner")
    bot_setting = relationship(
        "BotSetting",
        back_populates="owner",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Position(Base):
    __tablename__ = "positions"

    order_id = Column(String, primary_key=True, index=True)
    ticker = Column(String)
    open_date_time = Column(Integer)
    open_price = Column(Float)
    close_date_time = Column(Integer, default=None)
    close_price = Column(Float, default=None)
    margin = Column(Float)
    final_margin = Column(Float, default=None)
    volume = Column(Float)
    position_pnl_percentage = Column(Float, default=None)
    capital_pnl_percentage = Column(Float, default=None)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="positions")


class BotSetting(Base):
    __tablename__ = "bot_settings"

    id = Column(Integer, primary_key=True, index=True)
    is_bot_active = Column(Boolean, default=False)
    bingx_api_key = Column(String, default=None, unique=True)
    bingx_secret_key = Column(String, default=None, unique=True)
    default_margin = Column(Float, default=None)
    strategy_chg_percentage = Column(Float, default=None)
    sl_percentage = Column(Float, default=None)
    tp_percentage = Column(Float, default=None)
    coins_to_trade = Column(String, default=None)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="bot_setting")
