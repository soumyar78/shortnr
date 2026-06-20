require 'rails_helper'

RSpec.describe 'Api::V1::Auth', type: :request do
  describe 'POST /api/v1/auth/signup' do
    let(:valid_params) do
      {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password123'
      }
    end

    it 'creates a new user and returns a token' do
      post '/api/v1/auth/signup', params: valid_params
      expect(response).to have_http_status(:created)
      
      json = JSON.parse(response.body)
      expect(json['token']).to be_present
      expect(json['user']['email']).to eq('jane.doe@example.com')
      expect(json['user']['username']).to eq('janedoe')
    end

    it 'returns unprocessable entity if params are invalid' do
      post '/api/v1/auth/signup', params: { name: '', email: 'invalid' }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'POST /api/v1/auth/login' do
    let!(:user) { create(:user, email: 'login@example.com', password: 'password123') }

    it 'authenticates and returns a JWT token' do
      post '/api/v1/auth/login', params: { email: 'login@example.com', password: 'password123' }
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['token']).to be_present
      expect(json['user']['email']).to eq('login@example.com')
    end

    it 'rejects invalid credentials' do
      post '/api/v1/auth/login', params: { email: 'login@example.com', password: 'wrongpassword' }
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
