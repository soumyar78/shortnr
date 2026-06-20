require 'rails_helper'

RSpec.describe 'Api::V1::Links', type: :request do
  let(:user) { create(:user) }
  let(:token) { JsonWebToken.encode(user_id: user.id) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  describe 'GET /api/v1/links' do
    let!(:links) { create_list(:short_link, 3, user: user) }

    it 'returns the users short links' do
      get '/api/v1/links', headers: auth_headers
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['links'].size).to eq(3)
      expect(json['pagination']).to be_present
    end

    it 'rejects unauthenticated requests' do
      get '/api/v1/links'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/links/stats' do
    let!(:link1) { create(:short_link, user: user, click_count: 5) }
    let!(:link2) { create(:short_link, user: user, click_count: 10) }

    it 'returns total links and click count' do
      get '/api/v1/links/stats', headers: auth_headers
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['total_links']).to eq(2)
      expect(json['total_clicks']).to eq(15)
      expect(json['qr_codes_generated']).to eq(2)
    end
  end

  describe 'POST /api/v1/links' do
    let(:valid_params) { { original_url: 'https://rubyonrails.org', slug: 'rails' } }

    context 'when authenticated' do
      it 'creates a link associated with the user' do
        post '/api/v1/links', params: valid_params, headers: auth_headers
        expect(response).to have_http_status(:created)
        
        json = JSON.parse(response.body)
        expect(json['slug']).to eq('rails')
        expect(json['user_id']).to eq(user.id)
      end
    end

    context 'when guest' do
      it 'creates a link with user_id nil' do
        post '/api/v1/links', params: { original_url: 'https://google.com' }
        expect(response).to have_http_status(:created)
        
        json = JSON.parse(response.body)
        expect(json['user_id']).to be_nil
        expect(json['slug']).to be_present
      end
    end
  end

  describe 'DELETE /api/v1/links/:id' do
    let!(:link) { create(:short_link, user: user) }

    it 'deletes the link' do
      expect {
        delete "/api/v1/links/#{link.id}", headers: auth_headers
      }.to change(ShortLink, :count).by(-1)
      
      expect(response).to have_http_status(:no_content)
    end
  end

  describe 'GET /api/v1/links/resolve/:slug' do
    let!(:link) { create(:short_link, original_url: 'https://rubyonrails.org', slug: 'rails-resolved') }

    it 'resolves the slug and increments click count' do
      get '/api/v1/links/resolve/rails-resolved'
      expect(response).to have_http_status(:ok)
      
      json = JSON.parse(response.body)
      expect(json['original_url']).to eq('https://rubyonrails.org')
      expect(link.reload.click_count).to eq(1)
    end

    it 'returns 404 for nonexistent slug' do
      get '/api/v1/links/resolve/nonexistent-slug'
      expect(response).to have_http_status(:not_found)
    end
  end
end
