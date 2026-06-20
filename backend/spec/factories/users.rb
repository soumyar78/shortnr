FactoryBot.define do
  factory :user do
    name { "John Doe" }
    sequence(:email) { |n| "john.doe.#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
  end
end
