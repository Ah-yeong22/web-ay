package ex1_innerclass.staticclass;

public class User {

    String id;
    String password;
    String name;
    String email;
    int age;

    // 생성자는 Builder에서만 사용
    private User(Builder builder) {
        this.id = builder.id;
        this.password = builder.password;
        this.name = builder.name;
        this.email = builder.email;
        this.age = builder.age;
    }

    // static Builder 클래스
    public static class Builder {
        private String id;
        private String password;
        private String name;
        private String email;
        private int age;

        // 필수값 생성자
        public Builder(String id, String password) {
            this.id = id;
            this.password = password;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder age(int age) {
            this.age = age;
            return this;
        }

        public User build() {
            return new User(this);
        }

		public Builder id() {
			// TODO Auto-generated method stub
			return null;
		}
    }
}