#include <iostream>
int main(int argc, char **argv)
{
  float N = 0;
  std::cin >> N;
  std::cout << std::fixed;
  std::cout.precision(0);

  std::cout << N * 0.78 << " " << N * 0.956;
  return 0;
}