require 'rails_helper'

RSpec.describe 'Redirects', type: :request do
  describe 'GET /:slug' do
    context 'when slug exists' do
      let!(:link) { create(:short_link, original_url: 'https://example.com/target-page', slug: 'mytarget', click_count: 10) }

      it 'redirects to original URL and increments click count' do
        get '/mytarget'
        expect(response).to redirect_to('https://example.com/target-page')
        expect(response.status).to eq(302) # temporary redirect
        expect(link.reload.click_count).to eq(11)
      end
    end

    context 'when slug does not exist' do
      it 'redirects to frontend page with not found query' do
        get '/nonexistent'
        expect(response).to redirect_to('http://localhost:5173/not-found')
      end
    end
  end
end
