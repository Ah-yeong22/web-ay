package ex1_lambda;

@FunctionalInterface
public interface UserFilter {

	boolean test(User user);
}
