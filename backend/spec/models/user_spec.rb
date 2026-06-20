require 'rails_helper'

RSpec.describe User, type: :model do
  it 'has a valid factory' do
    expect(build(:user)).to be_valid
  end

  describe 'validations' do
    it 'requires name' do
      expect(build(:user, name: nil)).not_to be_valid
    end

    it 'requires email' do
      expect(build(:user, email: nil)).not_to be_valid
    end
    
    it 'validates email uniqueness' do
      user = create(:user)
      duplicate_user = build(:user, email: user.email)
      expect(duplicate_user).not_be_valid if respond_to?(:not_be_valid) # or simple rspec:
      expect(duplicate_user.valid?).to be false
    end

    it 'validates password length is at least 6' do
      user = build(:user, password: 'abc', password_confirmation: 'abc')
      expect(user.valid?).to be false
    end
  end

  describe 'callbacks' do
    it 'downcases email before saving' do
      user = create(:user, email: 'TEST@EXAMPLE.COM')
      expect(user.email).to eq('test@example.com')
    end

    it 'automatically creates a default bio profile on create' do
      user = create(:user, email: 'john@example.com')
      expect(user.bio_profile).to be_present
      expect(user.bio_profile.username).to eq('john')
      expect(user.bio_profile.bio).to eq('Welcome to my Shortnr bio page!')
    end
  end
end
