FactoryBot.define do
  factory :password_reset do
    association :user
    expires_at { 2.hours.from_now }
  end
end
