require 'rails_helper'

RSpec.describe 'Api::V1::Passwords', type: :request do
  let!(:user) { create(:user, name: 'John Doe', email: 'john.doe@example.com', password: 'password123') }

  describe 'POST /api/v1/passwords/forgot' do
    it 'always returns a generic success message even if user does not exist' do
      # Existing user
      expect {
        post '/api/v1/passwords/forgot', params: { email: 'john.doe@example.com' }
      }.to change { ActionMailer::Base.deliveries.count }.by(1)
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['message']).to include('If that email address exists')

      # Non-existing user
      expect {
        post '/api/v1/passwords/forgot', params: { email: 'nonexistent@example.com' }
      }.not_to change { ActionMailer::Base.deliveries.count }
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['message']).to include('If that email address exists')
    end
  end

  describe 'POST /api/v1/passwords/reset' do
    let(:token) { user.generate_token_for(:password_reset) }

    it 'resets the password with a valid token and then invalidates it' do
      # 1. Reset password
      post '/api/v1/passwords/reset', params: { token: token, password: 'newpassword123' }
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['message']).to include('successfully')

      user.reload
      expect(user.authenticate('newpassword123')).to be_truthy

      # 2. Re-try reset with same token (should fail as password change changed the salt, invalidating it)
      post '/api/v1/passwords/reset', params: { token: token, password: 'anotherpassword123' }
      expect(response).to have_http_status(:unprocessable_entity)
      
      json = JSON.parse(response.body)
      expect(json['error']).to include('invalid or has expired')
    end

    it 'returns unprocessable entity for expired or invalid tokens' do
      post '/api/v1/passwords/reset', params: { token: 'invalidtoken', password: 'newpassword123' }
      expect(response).to have_http_status(:unprocessable_entity)
      
      json = JSON.parse(response.body)
      expect(json['error']).to include('invalid or has expired')
    end

    it 'returns unprocessable entity for blank or short passwords' do
      post '/api/v1/passwords/reset', params: { token: token, password: '123' }
      expect(response).to have_http_status(:unprocessable_entity)
      
      json = JSON.parse(response.body)
      expect(json['error']).to include('at least 6 characters')
    end
  end
end
