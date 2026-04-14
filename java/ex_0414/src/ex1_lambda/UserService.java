package ex1_lambda;

import java.util.List;

public class UserService {

    public UserFilter getFilter(String type) {

        if(type.equals("adult")) {
            return user -> user.age >= 20;
        }
        else if(type.equals("seoul")) {
            return user -> user.city.equals("서울");
        }
        else if(type.equals("kim")) {
            return user -> user.name.startsWith("김");
        }

        return null;
    }


    public void filterUsers(List<User> list, UserFilter filter) {

        for(User user : list) {
            if(filter.test(user)) {
                System.out.println(user.name + " / " + user.age + " / " + user.city);
            }
        }
    }
}