require 'rails_helper'

RSpec.describe 'Api::V1::Profiles', type: :request do
  let!(:user) { create(:user, name: 'Original Name', password: 'password123') }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'PUT /api/v1/profile' do
    it 'updates user name and password when authenticated' do
      put '/api/v1/profile', params: { name: 'Updated Name', password: 'newpassword123' }, headers: headers
      expect(response).to have_http_status(:ok)

      user.reload
      expect(user.name).to eq('Updated Name')
      expect(user.authenticate('newpassword123')).to be_truthy
    end

    it 'allows updating only bio profile fields' do
      put '/api/v1/profile', params: { bio: 'New bio content', display_name: 'Show Name' }, headers: headers
      expect(response).to have_http_status(:ok)

      user.reload
      expect(user.name).to eq('Original Name') # Unchanged
      expect(user.bio_profile.bio).to eq('New bio content')
      expect(user.bio_profile.display_name).to eq('Show Name')
    end
  end
end
